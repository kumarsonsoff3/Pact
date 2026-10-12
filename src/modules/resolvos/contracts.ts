export type InvestigationFinding = {
  claimId: string;
  evidenceIds: string[];
  state: "SUPPORTED" | "CONTESTED" | "INSUFFICIENT";
  rationale: string;
};
export type RemedyCandidate = {
  caseId: string;
  revisionId: string;
  kind: "REQUEST_EVIDENCE" | "PARTIAL_REFUND" | "REPLAN";
  evidenceIds: string[];
  requiresHumanApproval: true;
};
export interface ResolvOS {
  investigate(caseId: string): Promise<InvestigationFinding[]>;
}
