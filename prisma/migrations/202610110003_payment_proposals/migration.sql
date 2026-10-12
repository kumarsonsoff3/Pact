CREATE TABLE "PaymentProposal" (
  "id" TEXT PRIMARY KEY,
  "missionId" TEXT NOT NULL REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "revisionId" TEXT NOT NULL REFERENCES "MissionRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "revisionVersion" INTEGER NOT NULL CHECK ("revisionVersion" > 0),
  "agreementHash" TEXT NOT NULL CHECK ("agreementHash" ~ '^[a-f0-9]{64}$'),
  "obligationId" TEXT NOT NULL,
  "amountMinor" BIGINT NOT NULL CHECK ("amountMinor" > 0),
  "currency" TEXT NOT NULL DEFAULT 'USD' CHECK ("currency" = 'USD'),
  "fingerprint" TEXT NOT NULL CHECK ("fingerprint" ~ '^[a-f0-9]{64}$'),
  "providerRequestId" TEXT NOT NULL UNIQUE,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL CHECK ("expiresAt" > "createdAt"),
  UNIQUE ("id", "missionId")
);
CREATE INDEX "PaymentProposal_missionId_createdAt_idx" ON "PaymentProposal"("missionId", "createdAt");
CREATE TABLE "PaymentProposalRequest" (
  "missionId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  PRIMARY KEY ("missionId", "requestId"),
  FOREIGN KEY ("proposalId", "missionId") REFERENCES "PaymentProposal"("id", "missionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE FUNCTION pact_protect_payment_proposal() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Payment review proposals and request bindings are immutable';
END;
$$;
CREATE TRIGGER "PaymentProposal_immutable" BEFORE UPDATE OR DELETE ON "PaymentProposal"
FOR EACH ROW EXECUTE FUNCTION pact_protect_payment_proposal();
CREATE TRIGGER "PaymentProposalRequest_immutable" BEFORE UPDATE OR DELETE ON "PaymentProposalRequest"
FOR EACH ROW EXECUTE FUNCTION pact_protect_payment_proposal();
