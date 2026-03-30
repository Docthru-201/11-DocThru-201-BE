-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3);
