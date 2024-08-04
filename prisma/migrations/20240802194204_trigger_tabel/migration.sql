-- CreateTable
CREATE TABLE "trigger_tabel" (
    "trigger_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trigger_tabel_pkey" PRIMARY KEY ("trigger_id")
);
