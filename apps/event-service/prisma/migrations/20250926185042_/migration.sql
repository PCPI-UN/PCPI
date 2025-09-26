/*
  Warnings:

  - You are about to drop the column `organization_id` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "organization_id";
