import { z } from "zod";
import { moneySchema } from "@/modules/intentos/contracts";

const key = z.string().regex(/^[a-zA-Z0-9_-]{1,48}$/);
export const agreementSchema = z
  .object({
    participants: z
      .array(
        z
          .object({
            id: key,
            name: z.string().trim().min(1).max(120),
            role: z.string().trim().min(1).max(80),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    obligations: z
      .array(
        z
          .object({
            id: key,
            participantId: key,
            title: z.string().trim().min(3).max(160),
            acceptance: z.string().trim().min(5).max(2000),
            allocationMinor: moneySchema.shape.amountMinor,
            dependsOn: z.array(key).max(50),
          })
          .strict(),
      )
      .min(1)
      .max(50),
    unknowns: z.array(z.string().trim().min(1).max(500)).max(30),
  })
  .strict();
export type Agreement = z.infer<typeof agreementSchema>;
export const revisionInputSchema = z
  .object({
    expectedVersion: z.number().int().min(0),
    agreement: agreementSchema,
  })
  .strict();
export const approvalInputSchema = z
  .object({
    revisionId: z.string().min(1),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    confirmed: z.literal(true),
  })
  .strict();

export class AgreementError extends Error {}
export class RevisionConflict extends Error {}

export function validateAgreement(
  input: unknown,
  budgetMinor: bigint,
): Agreement {
  const agreement = agreementSchema.parse(input);
  const participants = new Set(agreement.participants.map((p) => p.id));
  const obligations = new Map(agreement.obligations.map((o) => [o.id, o]));
  if (
    participants.size !== agreement.participants.length ||
    obligations.size !== agreement.obligations.length
  )
    throw new AgreementError("Participant and obligation IDs must be unique.");
  let total = 0n;
  for (const obligation of agreement.obligations) {
    if (!participants.has(obligation.participantId))
      throw new AgreementError("Every obligation needs a listed participant.");
    if (new Set(obligation.dependsOn).size !== obligation.dependsOn.length)
      throw new AgreementError("Dependencies must be unique.");
    for (const dependency of obligation.dependsOn)
      if (!obligations.has(dependency))
        throw new AgreementError(
          "Every dependency must reference a listed obligation.",
        );
    total += BigInt(obligation.allocationMinor);
  }
  if (total > budgetMinor)
    throw new AgreementError("Planned allocations exceed the mission budget.");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id))
      throw new AgreementError(
        "Obligation dependencies must not form a cycle.",
      );
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of obligations.get(id)!.dependsOn) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of obligations.keys()) visit(id);
  return agreement;
}
