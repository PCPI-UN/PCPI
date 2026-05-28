-- CreateTable
CREATE TABLE "public"."ranking_event" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "visible_public" BOOLEAN NOT NULL DEFAULT false,
    "positions" INTEGER NOT NULL,
    "grade_visible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ranking_event_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ranking_event_positions_check" CHECK ("positions" >= 0)
);

-- AddForeignKey
ALTER TABLE "public"."ranking_event" ADD CONSTRAINT "ranking_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
