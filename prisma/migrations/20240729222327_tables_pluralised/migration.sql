/*
  Warnings:

  - You are about to drop the `bar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tafel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bar_tafel_relatie" DROP CONSTRAINT "bar_tafel_relatie_bar_id_fkey";

-- DropForeignKey
ALTER TABLE "bar_tafel_relatie" DROP CONSTRAINT "bar_tafel_relatie_tafel_id_fkey";

-- DropTable
DROP TABLE "bar";

-- DropTable
DROP TABLE "tafel";

-- CreateTable
CREATE TABLE "bars" (
    "bar_id" SERIAL NOT NULL,
    "bar_naam" TEXT NOT NULL,

    CONSTRAINT "bars_pkey" PRIMARY KEY ("bar_id")
);

-- CreateTable
CREATE TABLE "tafels" (
    "tafel_id" SERIAL NOT NULL,

    CONSTRAINT "tafels_pkey" PRIMARY KEY ("tafel_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bars_bar_naam_key" ON "bars"("bar_naam");

-- AddForeignKey
ALTER TABLE "bar_tafel_relatie" ADD CONSTRAINT "bar_tafel_relatie_bar_id_fkey" FOREIGN KEY ("bar_id") REFERENCES "bars"("bar_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tafel_relatie" ADD CONSTRAINT "bar_tafel_relatie_tafel_id_fkey" FOREIGN KEY ("tafel_id") REFERENCES "tafels"("tafel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
