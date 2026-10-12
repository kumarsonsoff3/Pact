import { z } from "zod";
export const moneySchema = z.object({
  amountMinor: z
    .string()
    .regex(/^(0|[1-9]\d*)$/)
    .max(15),
  currency: z.literal("USD"),
});
export const missionDraftSchema = z
  .object({
    organizationId: z.string().min(1).max(128),
    title: z.string().trim().min(3).max(120),
    objective: z.string().trim().min(10).max(5000),
    budget: moneySchema,
  })
  .strict();
export type MissionDraftInput = z.infer<typeof missionDraftSchema>;
export type IntentCompileResult = {
  draft: MissionDraftInput;
  unknowns: string[];
  requiresHumanApproval: true;
  promptVersion: string;
  model: string;
};
export interface IntentOS {
  compile(objective: string): Promise<IntentCompileResult>;
}
