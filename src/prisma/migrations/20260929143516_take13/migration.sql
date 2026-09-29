-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "max_team_size" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "min_team_size" INTEGER NOT NULL DEFAULT 1;
