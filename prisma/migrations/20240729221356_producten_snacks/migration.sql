/*
  Warnings:

  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `snack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bestelling_product" DROP CONSTRAINT "bestelling_product_product_id_fkey";

-- DropForeignKey
ALTER TABLE "bestelling_product" DROP CONSTRAINT "bestelling_product_snack_id_fkey";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "snack";

-- CreateTable
CREATE TABLE "producten" (
    "product_id" SERIAL NOT NULL,
    "product_naam" TEXT NOT NULL,
    "product_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "producten_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "snacks" (
    "snack_id" SERIAL NOT NULL,
    "snack_naam" TEXT NOT NULL,
    "snack_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "snacks_pkey" PRIMARY KEY ("snack_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producten_product_naam_key" ON "producten"("product_naam");

-- CreateIndex
CREATE UNIQUE INDEX "snacks_snack_naam_key" ON "snacks"("snack_naam");

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "producten"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_snack_id_fkey" FOREIGN KEY ("snack_id") REFERENCES "snacks"("snack_id") ON DELETE SET NULL ON UPDATE CASCADE;
