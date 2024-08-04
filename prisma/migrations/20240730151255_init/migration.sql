-- DropForeignKey
ALTER TABLE "bar_tafel_relatie" DROP CONSTRAINT "bar_tafel_relatie_bar_id_fkey";

-- AddForeignKey
ALTER TABLE "bar_tafel_relatie" ADD CONSTRAINT "bar_tafel_relatie_bar_id_fkey" FOREIGN KEY ("bar_id") REFERENCES "bars"("bar_id") ON DELETE RESTRICT ON UPDATE CASCADE;
