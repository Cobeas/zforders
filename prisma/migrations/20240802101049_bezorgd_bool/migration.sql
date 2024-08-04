/*
  Warnings:

  - The `bezorgd` column on the `bestellingen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bestellingen" DROP COLUMN "bezorgd",
ADD COLUMN     "bezorgd" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "logboek" (
    "logboek_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "log_level" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "logboek_pkey" PRIMARY KEY ("logboek_id")
);
