ALTER TABLE "public"."pending_project_participants"
ADD COLUMN "semester" VARCHAR(50),
ADD COLUMN "career" VARCHAR(255);

UPDATE "public"."pending_project_participants"
SET
  "semester" = COALESCE(NULLIF("semester", ''), '1'),
  "career" = COALESCE(NULLIF("career", ''), 'Sin especificar');

ALTER TABLE "public"."pending_project_participants"
ALTER COLUMN "semester" SET NOT NULL,
ALTER COLUMN "career" SET NOT NULL;
