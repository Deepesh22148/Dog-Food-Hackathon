-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "hackathon_id" TEXT NOT NULL,
    "track_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount_usd" INTEGER,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prize_hackathon_id_idx" ON "Prize"("hackathon_id");

-- CreateIndex
CREATE INDEX "Prize_track_id_idx" ON "Prize"("track_id");

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "HackathonTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
