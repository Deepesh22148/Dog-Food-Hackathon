/*
  Warnings:

  - You are about to drop the column `is_team_leader` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HackathonParticipant" ADD COLUMN     "is_team_leader" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "is_team_leader";
