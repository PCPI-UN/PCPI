-- CreateTable
CREATE TABLE "public"."tiebreak" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "tiebreak_order" INTEGER NOT NULL,

    CONSTRAINT "tiebreak_pkey" PRIMARY KEY ("id")
);
