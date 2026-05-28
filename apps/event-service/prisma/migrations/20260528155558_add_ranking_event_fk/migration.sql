/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `ranking_event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ranking_event_event_id_key" ON "public"."ranking_event"("event_id");
