ALTER TABLE "Mission" ADD COLUMN "revisionHead" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_revisionHead_nonnegative" CHECK ("revisionHead" >= 0);
CREATE TABLE "MissionRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "missionId" TEXT NOT NULL REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "version" INTEGER NOT NULL CHECK ("version" > 0),
  "snapshot" JSONB NOT NULL,
  "contentHash" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "MissionRevision_approval_pair" CHECK (("approvedBy" IS NULL) = ("approvedAt" IS NULL))
);
CREATE UNIQUE INDEX "MissionRevision_missionId_version_key" ON "MissionRevision"("missionId", "version");

-- Every saved snapshot is immutable. The only allowed update records the first approval.
CREATE FUNCTION pact_protect_revision() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Saved agreement revisions cannot be deleted'; END IF;
  IF OLD."approvedAt" IS NOT NULL
    OR NEW."id" IS DISTINCT FROM OLD."id"
    OR NEW."missionId" IS DISTINCT FROM OLD."missionId"
    OR NEW."version" IS DISTINCT FROM OLD."version"
    OR NEW."snapshot" IS DISTINCT FROM OLD."snapshot"
    OR NEW."contentHash" IS DISTINCT FROM OLD."contentHash"
    OR NEW."createdBy" IS DISTINCT FROM OLD."createdBy"
    OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt"
    OR NEW."approvedBy" IS NULL OR NEW."approvedAt" IS NULL
  THEN RAISE EXCEPTION 'Saved agreement revisions are immutable'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "MissionRevision_immutable"
BEFORE UPDATE OR DELETE ON "MissionRevision"
FOR EACH ROW EXECUTE FUNCTION pact_protect_revision();
