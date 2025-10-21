-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'EXPIRED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "public"."InvitationTargetType" AS ENUM ('EVENT');

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "target_type" "public"."InvitationTargetType" NOT NULL,
    "target_id" INTEGER NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "invited_by_user_id" INTEGER NOT NULL,
    "invited_user_id" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvitationRole" (
    "invitation_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "InvitationRole_pkey" PRIMARY KEY ("invitation_id","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "public"."invitations"("token");

-- AddForeignKey
ALTER TABLE "public"."InvitationRole" ADD CONSTRAINT "InvitationRole_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
