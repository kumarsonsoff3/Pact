import { validateAgreement, type Agreement } from "./agreement";

/** A projection of terms, never a claim of delivery or provider settlement. */
export function projectAgreement(input: unknown, budgetMinor: string) {
  const agreement = validateAgreement(input, BigInt(budgetMinor));
  const byId = new Map(agreement.obligations.map((item) => [item.id, item]));
  const levels = new Map<string, number>();
  function level(id: string): number {
    if (levels.has(id)) return levels.get(id)!;
    const dependencies = byId.get(id)!.dependsOn;
    const value = dependencies.length
      ? 1 + Math.max(...dependencies.map(level))
      : 0;
    levels.set(id, value);
    return value;
  }
  const rows = new Map<number, number>();
  const milestones = agreement.obligations.map((item) => {
    const column = level(item.id);
    const row = rows.get(column) ?? 0;
    rows.set(column, row + 1);
    return {
      ...item,
      participant: agreement.participants.find(
        (p) => p.id === item.participantId,
      )!.name,
      dependencies: item.dependsOn.map((id) => ({
        id,
        title: byId.get(id)!.title,
      })),
      position: { x: column * 300, y: row * 160 },
    };
  });
  const allocated = agreement.obligations.reduce(
    (sum, item) => sum + BigInt(item.allocationMinor),
    0n,
  );
  return {
    milestones,
    allocatedMinor: allocated.toString(),
    unallocatedMinor: (BigInt(budgetMinor) - allocated).toString(),
    participantCount: agreement.participants.length,
    unknownCount: agreement.unknowns.length,
  };
}

export type AgreementChange = {
  subject: string;
  field: string;
  before: string;
  after: string;
};
export function compareAgreements(
  before: Agreement,
  after: Agreement,
): AgreementChange[] {
  const changes: AgreementChange[] = [];
  function record(
    subject: string,
    field: string,
    oldValue: string,
    newValue: string,
  ) {
    if (oldValue !== newValue)
      changes.push({ subject, field, before: oldValue, after: newValue });
  }
  for (const id of new Set(
    [...before.participants, ...after.participants].map((p) => p.id),
  )) {
    const old = before.participants.find((p) => p.id === id);
    const next = after.participants.find((p) => p.id === id);
    record(
      `Participant ${id}`,
      "Name / role",
      old ? `${old.name} / ${old.role}` : "Not included",
      next ? `${next.name} / ${next.role}` : "Removed",
    );
  }
  for (const id of new Set(
    [...before.obligations, ...after.obligations].map((o) => o.id),
  )) {
    const old = before.obligations.find((o) => o.id === id);
    const next = after.obligations.find((o) => o.id === id);
    const subject = next?.title || old!.title;
    if (!old || !next) {
      record(
        subject,
        "Milestone",
        old ? JSON.stringify(old) : "Not included",
        next ? JSON.stringify(next) : "Removed",
      );
      continue;
    }
    for (const [key, label] of [
      ["title", "Title"],
      ["participantId", "Responsible participant ID"],
      ["acceptance", "Completion evidence"],
      ["allocationMinor", "Planned allocation (USD cents)"],
    ] as const)
      record(subject, label, old[key], next[key]);
    record(
      subject,
      "Dependency IDs",
      [...old.dependsOn].sort().join(", ") || "None",
      [...next.dependsOn].sort().join(", ") || "None",
    );
  }
  record(
    "Agreement",
    "Open questions",
    before.unknowns.join("\n") || "None",
    after.unknowns.join("\n") || "None",
  );
  return changes;
}
