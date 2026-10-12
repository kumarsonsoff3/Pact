export const roles = [
  "OWNER",
  "OPERATOR",
  "PARTICIPANT",
  "REVIEWER",
  "DEMO_VIEWER",
] as const;
export type Role = (typeof roles)[number];
export type Membership = { userId: string; organizationId: string; role: Role };
export type PolicyDecision = {
  allowed: boolean;
  reasons: string[];
  policyVersion: "foundation-1";
  approvalRequired: boolean;
};
export class AccessError extends Error {}

export function evaluateMissionAccess(
  membership: Membership | null,
  userId: string,
  organizationId: string,
  action: "READ" | "CREATE_DRAFT",
): PolicyDecision {
  const scoped =
    membership?.userId === userId &&
    membership.organizationId === organizationId;
  const allowed = Boolean(
    scoped &&
    (action === "READ" ||
      membership?.role === "OWNER" ||
      membership?.role === "OPERATOR"),
  );
  return {
    allowed,
    reasons: allowed
      ? []
      : [scoped ? "ROLE_NOT_ALLOWED" : "MEMBERSHIP_REQUIRED"],
    policyVersion: "foundation-1",
    approvalRequired: false,
  };
}

export function assertMissionAccess(
  membership: Membership | null,
  userId: string,
  organizationId: string,
  action: "READ" | "CREATE_DRAFT",
) {
  const decision = evaluateMissionAccess(
    membership,
    userId,
    organizationId,
    action,
  );
  if (!decision.allowed) throw new AccessError(decision.reasons.join(","));
  return decision;
}

// Financial authorization is intentionally not implemented in this foundation.
// No payment mutation can use this mission-draft policy as payment permission.
