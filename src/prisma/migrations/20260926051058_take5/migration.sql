/*
  Warnings:

  - Added the required column `judging_end` to the `Hackathon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `judging_start` to the `Hackathon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_end` to the `Hackathon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_start` to the `Hackathon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submission_deadline` to the `Hackathon` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JudgeInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "judging_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "judging_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "submission_deadline" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HackathonJudge" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ADD COLUMN     "status" "JudgeInvitationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "HackathonParticipant" ADD COLUMN     "team_id" TEXT;

-- CreateTable
CREATE TABLE "HackathonTrack" (
    "id" TEXT NOT NULL,
    "hackathon_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "hackathon_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HackathonTrack_hackathon_id_idx" ON "HackathonTrack"("hackathon_id");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonTrack_hackathon_id_name_key" ON "HackathonTrack"("hackathon_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_invite_token_key" ON "Team"("invite_token");

-- CreateIndex
CREATE INDEX "Team_hackathon_id_idx" ON "Team"("hackathon_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_hackathon_id_name_key" ON "Team"("hackathon_id", "name");

-- CreateIndex
CREATE INDEX "ElevationRequest_status_idx" ON "ElevationRequest"("status");

-- CreateIndex
CREATE INDEX "Hackathon_organizer_id_idx" ON "Hackathon"("organizer_id");

-- CreateIndex
CREATE INDEX "HackathonJudge_user_id_idx" ON "HackathonJudge"("user_id");

-- CreateIndex
CREATE INDEX "HackathonJudge_hackathon_id_status_idx" ON "HackathonJudge"("hackathon_id", "status");

-- CreateIndex
CREATE INDEX "HackathonParticipant_user_id_idx" ON "HackathonParticipant"("user_id");

-- CreateIndex
CREATE INDEX "HackathonParticipant_team_id_idx" ON "HackathonParticipant"("team_id");

-- AddForeignKey
ALTER TABLE "HackathonTrack" ADD CONSTRAINT "HackathonTrack_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonParticipant" ADD CONSTRAINT "HackathonParticipant_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
