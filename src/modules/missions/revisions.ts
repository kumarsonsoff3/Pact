import "server-only";
import { createHash } from "node:crypto";
import { getDatabase } from "@/lib/db";
import { AccessError, assertMissionAccess } from "@/modules/agentguard/policy";
import {
  AgreementError,
  RevisionConflict,
  revisionInputSchema,
  approvalInputSchema,
  validateAgreement,
} from "./agreement";

export function agreementHash(snapshot: unknown) {
  function canonical(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value !== null && typeof value === "object")
      return `{${Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
        .join(",")}}`;
    return JSON.stringify(value) ?? "null";
  }
  return createHash("sha256").update(canonical(snapshot)).digest("hex");
}

export async function readMission(userId: string, missionId: string) {
  const db = getDatabase();
  const mission = await db.mission.findFirst({
    where: {
      id: missionId,
      organization: { memberships: { some: { userId } } },
    },
    include: {
      revisions: { orderBy: { version: "desc" }, take: 30 },
      traces: { orderBy: { createdAt: "desc" }, take: 50 },
      paymentProposals: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!mission) throw new AccessError("Mission unavailable.");
  const membership = await db.membership.findUnique({
    where: {
      organizationId_userId: { organizationId: mission.organizationId, userId },
    },
  });
  assertMissionAccess(membership, userId, mission.organizationId, "READ");
  return { mission, role: membership!.role };
}

export async function saveRevision(
  userId: string,
  missionId: string,
  input: unknown,
) {
  const data = revisionInputSchema.parse(input);
  return getDatabase().$transaction(
    async (tx) => {
      const mission = await tx.mission.findFirst({
        where: {
          id: missionId,
          organization: { memberships: { some: { userId } } },
        },
      });
      if (!mission) throw new AccessError("Mission unavailable.");
      const membership = await tx.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: mission.organizationId,
            userId,
          },
        },
      });
      assertMissionAccess(
        membership,
        userId,
        mission.organizationId,
        "CREATE_DRAFT",
      );
      const agreement = validateAgreement(data.agreement, mission.budgetMinor);
      const locked = await tx.mission.updateMany({
        where: { id: missionId, revisionHead: data.expectedVersion },
        data: { revisionHead: { increment: 1 } },
      });
      if (locked.count !== 1)
        throw new RevisionConflict(
          "The agreement changed. Reload before saving.",
        );
      const snapshot = {
        objective: mission.objective,
        budgetMinor: mission.budgetMinor.toString(),
        currency: mission.currency,
        ...agreement,
      };
      const revision = await tx.missionRevision.create({
        data: {
          missionId,
          version: data.expectedVersion + 1,
          snapshot,
          contentHash: agreementHash(snapshot),
          createdBy: userId,
        },
      });
      await tx.blackBoxTraceEvent.create({
        data: {
          organizationId: mission.organizationId,
          missionId,
          actorId: userId,
          type: "AGREEMENT_REVISION_DRAFTED",
          payload: {
            revisionId: revision.id,
            version: revision.version,
            contentHash: revision.contentHash,
            source: "HUMAN_INPUT",
            financialEffect: "NONE",
          },
        },
      });
      return revision;
    },
    { isolationLevel: "Serializable" },
  );
}

export async function approveRevision(
  userId: string,
  missionId: string,
  input: unknown,
) {
  const data = approvalInputSchema.parse(input);
  return getDatabase().$transaction(
    async (tx) => {
      const mission = await tx.mission.findFirst({
        where: {
          id: missionId,
          organization: { memberships: { some: { userId } } },
        },
      });
      if (!mission) throw new AccessError("Mission unavailable.");
      const membership = await tx.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: mission.organizationId,
            userId,
          },
        },
      });
      assertMissionAccess(membership, userId, mission.organizationId, "READ");
      if (membership!.role !== "OWNER")
        throw new AccessError("Only the workspace owner can approve terms.");
      // Lock the same parent row used by draft creation, serializing approval vs. amendments.
      const locked = await tx.mission.updateMany({
        where: { id: missionId, revisionHead: mission.revisionHead },
        data: { revisionHead: { increment: 0 } },
      });
      if (locked.count !== 1)
        throw new RevisionConflict(
          "The agreement changed. Reload before approving.",
        );
      const revision = await tx.missionRevision.findUnique({
        where: { id: data.revisionId },
      });
      if (
        !revision ||
        revision.missionId !== missionId ||
        revision.version !== mission.revisionHead ||
        revision.contentHash !== data.contentHash
      )
        throw new RevisionConflict(
          "Approve the latest exact revision after reviewing it.",
        );
      if (revision.approvedAt) return revision; // Repeated approval has no additional state change.
      const snapshot = revision.snapshot as Record<string, unknown>;
      if (!Array.isArray(snapshot.unknowns) || snapshot.unknowns.length)
        throw new AgreementError(
          "Resolve all open questions before approving terms.",
        );
      if (agreementHash(snapshot) !== revision.contentHash)
        throw new RevisionConflict(
          "The stored agreement fingerprint does not match.",
        );
      const approved = await tx.missionRevision.update({
        where: { id: revision.id },
        data: { approvedBy: userId, approvedAt: new Date() },
      });
      await tx.blackBoxTraceEvent.create({
        data: {
          organizationId: mission.organizationId,
          missionId,
          actorId: userId,
          type: "AGREEMENT_OWNER_APPROVED",
          payload: {
            revisionId: revision.id,
            version: revision.version,
            contentHash: revision.contentHash,
            approvalScope: "WORKSPACE_OWNER_TERMS_ONLY",
            counterpartyConsent: "NOT_RECORDED",
            financialEffect: "NONE",
          },
        },
      });
      return approved;
    },
    { isolationLevel: "Serializable" },
  );
}
