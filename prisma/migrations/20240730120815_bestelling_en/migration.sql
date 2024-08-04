/*
  Warnings:

  - You are about to drop the `bestelling` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bestelling_product" DROP CONSTRAINT "bestelling_product_bestelling_id_fkey";

-- DropTable
DROP TABLE "bestelling";

-- CreateTable
CREATE TABLE "bestellingen" (
    "bestelling_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tafel" INTEGER NOT NULL,
    "notities" TEXT,
    "bar" INTEGER,
    "bezorgd" TEXT,

    CONSTRAINT "bestellingen_pkey" PRIMARY KEY ("bestelling_id")
);

-- AddForeignKey
ALTER TABLE "bestelling_product" ADD CONSTRAINT "bestelling_product_bestelling_id_fkey" FOREIGN KEY ("bestelling_id") REFERENCES "bestellingen"("bestelling_id") ON DELETE RESTRICT ON UPDATE CASCADE;
