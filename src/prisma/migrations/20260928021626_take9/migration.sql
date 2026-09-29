-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "hackathon_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "track_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repository_url" TEXT,
    "demo_url" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_team_id_key" ON "Project"("team_id");

-- CreateIndex
CREATE INDEX "Project_hackathon_id_status_idx" ON "Project"("hackathon_id", "status");

-- CreateIndex
CREATE INDEX "Project_track_id_idx" ON "Project"("track_id");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "HackathonTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
