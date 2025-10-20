-- CreateEnum
CREATE TYPE "public"."ProjectState" AS ENUM ('UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PendingParticipantStatus" AS ENUM ('PENDING', 'INVITED', 'JOINED');

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_number" VARCHAR(150),
    "state" "public"."ProjectState" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_documents" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_participants" (
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "studentCode" INTEGER,

    CONSTRAINT "project_participants_pkey" PRIMARY KEY ("user_id","project_id")
);

-- CreateTable
CREATE TABLE "public"."project_assignments" (
    "project_id" INTEGER NOT NULL,
    "member_user_id" INTEGER NOT NULL,
    "member_event_id" INTEGER NOT NULL,
    "member_role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("project_id","member_user_id","member_event_id","member_role_id")
);

-- CreateTable
CREATE TABLE "public"."pending_project_participants" (
    "pendingId" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "student_code" INTEGER,
    "status" "public"."PendingParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "invited_at" TIMESTAMP,
    "joined_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "pending_project_participants_pkey" PRIMARY KEY ("pendingId")
);

-- AddForeignKey
ALTER TABLE "public"."project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_participants" ADD CONSTRAINT "project_participants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_assignments" ADD CONSTRAINT "project_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_project_participants" ADD CONSTRAINT "pending_project_participants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
