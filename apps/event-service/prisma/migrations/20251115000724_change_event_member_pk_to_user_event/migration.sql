-- AlterTable
-- Change primary key from (userId, eventId, roleId) to (userId, eventId)
-- This enforces that a user can only have ONE role per event

-- First, drop the old primary key constraint
ALTER TABLE "event_members" DROP CONSTRAINT "event_members_pkey";

-- Add the new primary key constraint
-- Note: This will fail if there are existing records with duplicate (user_id, event_id) combinations
-- In that case, you'll need to clean up the data first
ALTER TABLE "event_members" ADD CONSTRAINT "event_members_pkey" PRIMARY KEY ("user_id", "event_id");
