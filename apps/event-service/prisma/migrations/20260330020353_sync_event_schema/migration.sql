/*
  Warnings:

  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."eventType" AS ENUM ('Exposition', 'Competition');

-- CreateEnum
CREATE TYPE "public"."EvaluationType" AS ENUM ('ZERO_TO_FIVE', 'ZERO_TO_HUNDRED');

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_members" DROP CONSTRAINT "event_members_event_id_fkey";

-- DropTable
DROP TABLE "public"."courses";

-- DropTable
DROP TABLE "public"."events";

-- CreateTable
CREATE TABLE "public"."event" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "access_code" VARCHAR(100) NOT NULL,
    "is_publicly_joinable" BOOLEAN NOT NULL,
    "inscription_deadline" TIMESTAMPTZ NOT NULL,
    "inscription_cost" DOUBLE PRECISION,
    "evaluations_opened" BOOLEAN NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "locationDetails" TEXT,
    "evaluation_type" "public"."EvaluationType",
    "inscriptionRequirements" TEXT,
    "minimum_team_size" INTEGER,
    "aboutOurAllies" TEXT,
    "event_type" "public"."eventType" NOT NULL,
    "collaborators" VARCHAR(255)[],
    "organizers" VARCHAR(255)[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_inscriptions_details" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "value" INTEGER DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_inscriptions_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_recaps" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "headline" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "closing_message" TEXT,
    "galery_url" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_recaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_awards" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "category_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."award_winners" (
    "id" SERIAL NOT NULL,
    "award_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_user_id" INTEGER NOT NULL,

    CONSTRAINT "award_winners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_access_code_key" ON "public"."event"("access_code");

-- AddForeignKey
ALTER TABLE "public"."event_inscriptions_details" ADD CONSTRAINT "event_inscriptions_details_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_recaps" ADD CONSTRAINT "event_recaps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_members" ADD CONSTRAINT "event_members_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_awards" ADD CONSTRAINT "category_awards_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."award_winners" ADD CONSTRAINT "award_winners_award_id_fkey" FOREIGN KEY ("award_id") REFERENCES "public"."category_awards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
