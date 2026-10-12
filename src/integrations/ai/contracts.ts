export interface AIAdapter {
  generateStructured(input: {
    purpose: "INTENT_DRAFT" | "CASE_FINDINGS";
    promptVersion: string;
    authorizedContext: string;
  }): Promise<unknown>;
}
// Implement only after selecting a provider. Parse every result with domain Zod schemas.
