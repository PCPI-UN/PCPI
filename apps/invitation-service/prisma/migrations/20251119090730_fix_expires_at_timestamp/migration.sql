/*
  Warnings:

  - Changed the type of `expires_at` on the `invitations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `invited_user_id` on table `invitations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."InvitationTargetType" ADD VALUE 'PLATFORM';
ALTER TYPE "public"."InvitationTargetType" ADD VALUE 'PROJECT';

-- AlterTable
ALTER TABLE "public"."invitations" DROP COLUMN "expires_at",
ADD COLUMN     "expires_at" TIMESTAMPTZ NOT NULL,
ALTER COLUMN "invited_user_id" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;
