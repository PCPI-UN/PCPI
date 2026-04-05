/*
  Warnings:

  - You are about to drop the column `rejection_reason` on the `projects` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."ProjectState" ADD VALUE 'REQUEST_CHANGES';

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "rejection_reason",
ADD COLUMN     "reason" TEXT;
