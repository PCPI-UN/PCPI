-- CreateTable
CREATE TABLE "public"."evaluations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "member_user_id" INTEGER NOT NULL,
    "member_event_id" INTEGER NOT NULL,
    "member_role_id" INTEGER NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluation_detail" (
    "evaluation_id" INTEGER NOT NULL,
    "criterion_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "evaluation_detail_pkey" PRIMARY KEY ("evaluation_id","criterion_id")
);

-- CreateTable
CREATE TABLE "public"."criterions" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "criterions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."evaluation_detail" ADD CONSTRAINT "evaluation_detail_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluation_detail" ADD CONSTRAINT "evaluation_detail_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "public"."criterions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
