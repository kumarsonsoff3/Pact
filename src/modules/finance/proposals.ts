import "server-only";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/db";
import { retryDatabaseConflict } from "@/lib/database-errors";
import type { PaymentProposal } from "@/generated/prisma/client";
import { AccessError } from "@/modules/agentguard/policy";
import { agreementHash } from "@/modules/missions/revisions";
import {
  AgreementError,
  RevisionConflict,
  validateAgreement,
} from "@/modules/missions/agreement";
import { paymentProposalInput, type ProposalView } from "./contracts";

export function proposalView(
  proposal: PaymentProposal,
  currentVersion: number,
  now = new Date(),
): ProposalView {
  return {
    id: proposal.id,
    revisionId: proposal.revisionId,
    revisionVersion: proposal.revisionVersion,
    obligationId: proposal.obligationId,
    amountMinor: proposal.amountMinor.toString(),
    currency: proposal.currency,
    fingerprint: proposal.fingerprint,
    expiresAt: proposal.expiresAt.toISOString(),
    executionAllowed: false,
    blockers: [
      ...(proposal.revisionVersion !== currentVersion
        ? ["Agreement has changed; prepare a review of the current terms."]
        : []),
      ...(proposal.expiresAt <= now ? ["Review window expired."] : []),
      "Outcome evidence verification is not connected.",
      "Merchant binding and exact payment approval are not connected.",
      "PayPal execution is not enabled.",
    ],
  };
}

export async function preparePaymentProposal(
  userId: string,
  missionId: string,
  input: unknown,
) {
  const data = paymentProposalInput.parse(input);
  return retryDatabaseConflict(() =>
    getDatabase().$transaction(
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
        if (
          membership?.role !== "OWNER" ||
          membership.userId !== userId ||
          membership.organizationId !== mission.organizationId
        )
          throw new AccessError(
            "Only the workspace owner can prepare a payment review.",
          );
        const lock = await tx.mission.updateMany({
          where: { id: mission.id, revisionHead: mission.revisionHead },
          data: { revisionHead: { increment: 0 } },
        });
        if (lock.count !== 1)
          throw new RevisionConflict(
            "The agreement changed. Reload before reviewing payment.",
          );
        const now = new Date();
        const binding = await tx.paymentProposalRequest.findUnique({
          where: {
            missionId_requestId: { missionId, requestId: data.requestId },
          },
          include: { proposal: true },
        });
        if (binding) {
          const p = binding.proposal;
          if (
            p.revisionId !== data.revisionId ||
            p.agreementHash !== data.contentHash ||
            p.obligationId !== data.obligationId
          )
            throw new RevisionConflict(
              "This request ID already belongs to different payment terms.",
            );
          return {
            proposal: proposalView(p, mission.revisionHead, now),
            reused: true,
          };
        }
        const revision = await tx.missionRevision.findUnique({
          where: { id: data.revisionId },
        });
        if (
          !revision ||
          revision.missionId !== missionId ||
          revision.version !== mission.revisionHead ||
          !revision.approvedAt ||
          revision.contentHash !== data.contentHash ||
          agreementHash(revision.snapshot) !== data.contentHash
        )
          throw new RevisionConflict(
            "Review and approve the latest exact agreement before preparing payment.",
          );
        const snapshot = revision.snapshot as Record<string, unknown>;
        const agreement = validateAgreement(
          {
            participants: snapshot.participants,
            obligations: snapshot.obligations,
            unknowns: snapshot.unknowns,
          },
          mission.budgetMinor,
        );
        if (agreement.unknowns.length)
          throw new AgreementError(
            "Resolve the agreement's open questions first.",
          );
        const obligation = agreement.obligations.find(
          (item) => item.id === data.obligationId,
        );
        if (!obligation || BigInt(obligation.allocationMinor) <= 0n)
          throw new AgreementError(
            "Choose a milestone with a positive planned allocation.",
          );
        let proposal = await tx.paymentProposal.findFirst({
          where: {
            missionId,
            revisionId: revision.id,
            obligationId: obligation.id,
            expiresAt: { gt: now },
          },
          orderBy: { createdAt: "desc" },
        });
        const reused = Boolean(proposal);
        if (!proposal) {
          const command = {
            id: randomUUID(),
            missionId,
            revisionId: revision.id,
            revisionVersion: revision.version,
            agreementHash: revision.contentHash,
            obligationId: obligation.id,
            amountMinor: obligation.allocationMinor,
            currency: "USD",
            providerRequestId: randomUUID(),
            createdBy: userId,
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
            scope: "NON_EXECUTABLE_PAYMENT_REVIEW",
          };
          const { scope: _scope, ...record } = command;
          void _scope;
          proposal = await tx.paymentProposal.create({
            data: {
              ...record,
              amountMinor: BigInt(command.amountMinor),
              fingerprint: agreementHash(command),
            },
          });
          await tx.blackBoxTraceEvent.create({
            data: {
              organizationId: mission.organizationId,
              missionId,
              actorId: userId,
              type: "PAYMENT_REVIEW_PREPARED",
              payload: {
                proposalId: proposal.id,
                revisionId: revision.id,
                agreementHash: revision.contentHash,
                fingerprint: proposal.fingerprint,
                obligationId: obligation.id,
                amountMinor: obligation.allocationMinor,
                currency: "USD",
                financialEffect: "NONE",
                executionAllowed: false,
              },
            },
          });
        }
        await tx.paymentProposalRequest.create({
          data: {
            missionId,
            requestId: data.requestId,
            proposalId: proposal.id,
          },
        });
        return {
          proposal: proposalView(proposal, mission.revisionHead, now),
          reused,
        };
      },
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 20_000 },
    ),
  );
}
