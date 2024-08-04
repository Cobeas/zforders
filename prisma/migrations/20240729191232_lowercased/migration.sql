/*
  Warnings:

  - You are about to drop the `Bar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BarTafelRelatie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bestelling` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BestellingProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Setup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Snack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tafel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BarTafelRelatie" DROP CONSTRAINT "BarTafelRelatie_bar_id_fkey";

-- DropForeignKey
ALTER TABLE "BarTafelRelatie" DROP CONSTRAINT "BarTafelRelatie_tafel_id_fkey";

-- DropForeignKey
ALTER TABLE "BestellingProduct" DROP CONSTRAINT "BestellingProduct_bestelling_id_fkey";

-- DropForeignKey
ALTER TABLE "BestellingProduct" DROP CONSTRAINT "BestellingProduct_product_id_fkey";

-- DropForeignKey
ALTER TABLE "BestellingProduct" DROP CONSTRAINT "BestellingProduct_snack_id_fkey";

-- DropTable
DROP TABLE "Bar";

-- DropTable
DROP TABLE "BarTafelRelatie";

-- DropTable
DROP TABLE "Bestelling";

-- DropTable
DROP TABLE "BestellingProduct";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Setup";

-- DropTable
DROP TABLE "Snack";

-- DropTable
DROP TABLE "Tafel";

-- CreateTable
CREATE TABLE "product" (
    "product_id" SERIAL NOT NULL,
    "product_naam" TEXT NOT NULL,
    "product_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "snack" (
    "snack_id" SERIAL NOT NULL,
    "snack_naam" TEXT NOT NULL,
    "snack_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "snack_pkey" PRIMARY KEY ("snack_id")
);

-- CreateTable
CREATE TABLE "bestelling" (
    "bestelling_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tafel" INTEGER NOT NULL,
    "notities" TEXT,
    "bar" INTEGER,
    "bezorgd" TEXT,

    CONSTRAINT "bestelling_pkey" PRIMARY KEY ("bestelling_id")
);

-- CreateTable
CREATE TABLE "bestelling_product" (
    "id" SERIAL NOT NULL,
    "bestelling_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "snack_id" INTEGER,
    "aantal" INTEGER NOT NULL,

    CONSTRAINT "bestelling_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setup" (
    "setup_id" SERIAL NOT NULL,

    CONSTRAINT "setup_pkey" PRIMARY KEY ("setup_id")
);

-- CreateTable
CREATE TABLE "bar" (
    "bar_id" SERIAL NOT NULL,
    "bar_naam" TEXT NOT NULL,

    CONSTRAINT "bar_pkey" PRIMARY KEY ("bar_id")
);

-- CreateTable
CREATE TABLE "tafel" (
    "tafel_id" SERIAL NOT NULL,

    CONSTRAINT "tafel_pkey" PRIMARY KEY ("tafel_id")
);

-- CreateTable
CREATE TABLE "bar_tafel_relatie" (
    "relatie_id" SERIAL NOT NULL,
    "bar_id" INTEGER NOT NULL,
    "tafel_id" INTEGER NOT NULL,

    CONSTRAINT "bar_tafel_relatie_pkey" PRIMARY KEY ("relatie_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_product_naam_key" ON "product"("product_naam");

-- CreateIndex
CREATE UNIQUE INDEX "snack_snack_naam_key" ON "snack"("snack_naam");

-- CreateIndex
CREATE UNIQUE INDEX "bestelling_product_bestelling_id_product_id_snack_id_key" ON "bestelling_product"("bestelling_id", "product_id", "snack_id");

-- CreateIndex
CREATE UNIQUE INDEX "bar_bar_naam_key" ON "bar"("bar_naam");

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_bestelling_id_fkey" FOREIGN KEY ("bestelling_id") REFERENCES "bestelling"("bestelling_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_snack_id_fkey" FOREIGN KEY ("snack_id") REFERENCES "snack"("snack_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tafel_relatie" ADD CONSTRAINT "bar_tafel_relatie_bar_id_fkey" FOREIGN KEY ("bar_id") REFERENCES "bar"("bar_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bar_tafel_relatie" ADD CONSTRAINT "bar_tafel_relatie_tafel_id_fkey" FOREIGN KEY ("tafel_id") REFERENCES "tafel"("tafel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
