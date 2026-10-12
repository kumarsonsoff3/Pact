import "server-only";
import { getDatabase } from "@/lib/db";
import { assertMissionAccess } from "@/modules/agentguard/policy";
import { missionDraftSchema } from "@/modules/intentos/contracts";

export async function createMissionDraft(userId: string, input: unknown) {
  const data = missionDraftSchema.parse(input);
  return getDatabase().$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: {
        organizationId_userId: { organizationId: data.organizationId, userId },
      },
    });
    const decision = assertMissionAccess(
      membership,
      userId,
      data.organizationId,
      "CREATE_DRAFT",
    );
    const mission = await tx.mission.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        objective: data.objective,
        budgetMinor: BigInt(data.budget.amountMinor),
        currency: data.budget.currency,
        createdBy: userId,
      },
    });
    await tx.blackBoxTraceEvent.create({
      data: {
        organizationId: data.organizationId,
        missionId: mission.id,
        actorId: userId,
        type: "MISSION_DRAFT_CREATED",
        payload: {
          state: "DRAFT",
          policyVersion: decision.policyVersion,
          source: "HUMAN_INPUT",
          financialEffect: "NONE",
        },
      },
    });
    return { ...mission, budgetMinor: mission.budgetMinor.toString() };
  });
}

export async function listMissions(userId: string, organizationId: string) {
  const db = getDatabase();
  const membership = await db.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  assertMissionAccess(membership, userId, organizationId, "READ");
  const missions = await db.mission.findMany({
    where: {
      organizationId,
      organization: { memberships: { some: { userId } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return missions.map((mission) => ({
    ...mission,
    budgetMinor: mission.budgetMinor.toString(),
  }));
}
