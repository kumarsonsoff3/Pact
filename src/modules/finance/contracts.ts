import { z } from "zod";

export const paymentProposalInput = z
  .object({
    revisionId: z.string().min(1).max(128),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    obligationId: z.string().regex(/^[a-zA-Z0-9_-]{1,48}$/),
    requestId: z.uuid(),
  })
  .strict();

export type ProposalView = {
  id: string;
  revisionId: string;
  revisionVersion: number;
  obligationId: string;
  amountMinor: string;
  currency: string;
  fingerprint: string;
  expiresAt: string;
  executionAllowed: false;
  blockers: string[];
};
