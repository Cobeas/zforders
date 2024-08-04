-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "product_naam" TEXT NOT NULL,
    "product_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Snack" (
    "snack_id" SERIAL NOT NULL,
    "snack_naam" TEXT NOT NULL,
    "snack_prijs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Snack_pkey" PRIMARY KEY ("snack_id")
);

-- CreateTable
CREATE TABLE "Bestelling" (
    "bestelling_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tafel" INTEGER NOT NULL,
    "notities" TEXT,
    "bar" INTEGER,
    "bezorgd" TEXT,

    CONSTRAINT "Bestelling_pkey" PRIMARY KEY ("bestelling_id")
);

-- CreateTable
CREATE TABLE "BestellingProduct" (
    "id" SERIAL NOT NULL,
    "bestelling_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "snack_id" INTEGER,
    "aantal" INTEGER NOT NULL,

    CONSTRAINT "BestellingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setup" (
    "setup_id" SERIAL NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("setup_id")
);

-- CreateTable
CREATE TABLE "Bar" (
    "bar_id" SERIAL NOT NULL,
    "bar_naam" TEXT NOT NULL,

    CONSTRAINT "Bar_pkey" PRIMARY KEY ("bar_id")
);

-- CreateTable
CREATE TABLE "Tafel" (
    "tafel_id" SERIAL NOT NULL,

    CONSTRAINT "Tafel_pkey" PRIMARY KEY ("tafel_id")
);

-- CreateTable
CREATE TABLE "BarTafelRelatie" (
    "relatie_id" SERIAL NOT NULL,
    "bar_id" INTEGER NOT NULL,
    "tafel_id" INTEGER NOT NULL,

    CONSTRAINT "BarTafelRelatie_pkey" PRIMARY KEY ("relatie_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_naam_key" ON "Product"("product_naam");

-- CreateIndex
CREATE UNIQUE INDEX "Snack_snack_naam_key" ON "Snack"("snack_naam");

-- CreateIndex
CREATE UNIQUE INDEX "BestellingProduct_bestelling_id_product_id_snack_id_key" ON "BestellingProduct"("bestelling_id", "product_id", "snack_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bar_bar_naam_key" ON "Bar"("bar_naam");

-- AddForeignKey
ALTER TABLE "BestellingProduct" ADD CONSTRAINT "BestellingProduct_bestelling_id_fkey" FOREIGN KEY ("bestelling_id") REFERENCES "Bestelling"("bestelling_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestellingProduct" ADD CONSTRAINT "BestellingProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestellingProduct" ADD CONSTRAINT "BestellingProduct_snack_id_fkey" FOREIGN KEY ("snack_id") REFERENCES "Snack"("snack_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarTafelRelatie" ADD CONSTRAINT "BarTafelRelatie_bar_id_fkey" FOREIGN KEY ("bar_id") REFERENCES "Bar"("bar_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarTafelRelatie" ADD CONSTRAINT "BarTafelRelatie_tafel_id_fkey" FOREIGN KEY ("tafel_id") REFERENCES "Tafel"("tafel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
