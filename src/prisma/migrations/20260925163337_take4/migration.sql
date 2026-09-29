/*
  Warnings:

  - The values [DENIED] on the enum `ElevationRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ElevationRequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'BLOCKED');
ALTER TABLE "public"."ElevationRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ElevationRequest" ALTER COLUMN "status" TYPE "ElevationRequestStatus_new" USING ("status"::text::"ElevationRequestStatus_new");
ALTER TYPE "ElevationRequestStatus" RENAME TO "ElevationRequestStatus_old";
ALTER TYPE "ElevationRequestStatus_new" RENAME TO "ElevationRequestStatus";
DROP TYPE "public"."ElevationRequestStatus_old";
ALTER TABLE "ElevationRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
