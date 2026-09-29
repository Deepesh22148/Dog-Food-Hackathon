-- CreateTable
CREATE TABLE "HackathonJudgeTrack" (
    "judge_id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,

    CONSTRAINT "HackathonJudgeTrack_pkey" PRIMARY KEY ("judge_id","track_id")
);

-- CreateIndex
CREATE INDEX "HackathonJudgeTrack_track_id_idx" ON "HackathonJudgeTrack"("track_id");

-- AddForeignKey
ALTER TABLE "HackathonJudgeTrack" ADD CONSTRAINT "HackathonJudgeTrack_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "HackathonJudge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonJudgeTrack" ADD CONSTRAINT "HackathonJudgeTrack_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "HackathonTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
