-- AlterEnum: add FINAL_PROJECTS value to EvaluationType
-- Note: ALTER TYPE ADD VALUE cannot run inside a transaction in PostgreSQL < 12.
-- PostgreSQL 16 (used in this project) supports it correctly.
ALTER TYPE "public"."EvaluationType" ADD VALUE 'FINAL_PROJECTS';
COMMIT;

-- AlterTable: set FINAL_PROJECTS as the default for new events
-- Existing rows with NULL evaluation_type are unchanged (backward compatible).
-- The application layer (toProtoEvaluationType) already treats NULL as FINAL_PROJECTS.
ALTER TABLE "public"."event" ALTER COLUMN "evaluation_type" SET DEFAULT 'FINAL_PROJECTS';
