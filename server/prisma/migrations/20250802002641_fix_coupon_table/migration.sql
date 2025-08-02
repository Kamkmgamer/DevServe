/*
  Warnings:

  - You are about to alter the column `type` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE "public"."Coupon" ALTER COLUMN "type" SET DATA TYPE VARCHAR(10);

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_active_idx" ON "public"."Coupon"("active");

-- CreateIndex
CREATE INDEX "Coupon_expiresAt_idx" ON "public"."Coupon"("expiresAt");
