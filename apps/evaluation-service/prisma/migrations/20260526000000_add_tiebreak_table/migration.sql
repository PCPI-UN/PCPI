-- CreateTable
CREATE TABLE "public"."tiebreaks" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "tiebreak_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "tiebreaks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tiebreaks_tiebreak_order_positive" CHECK ("tiebreak_order" > 0)
);
