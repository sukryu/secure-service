/*
  Warnings:

  - You are about to drop the column `rememberCreatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reset_password_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_resetPasswordToken_key";

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "is_deleted" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "deleted_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rememberCreatedAt",
DROP COLUMN "resetPasswordSentAt",
DROP COLUMN "resetPasswordToken",
ADD COLUMN     "remember_created_at" TIMESTAMP(3),
ADD COLUMN     "reset_password_sent_at" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT,
ALTER COLUMN "sign_in_count" DROP NOT NULL,
ALTER COLUMN "current_sign_in_at" DROP NOT NULL,
ALTER COLUMN "last_sign_in_at" DROP NOT NULL,
ALTER COLUMN "current_sign_in_ip" DROP NOT NULL,
ALTER COLUMN "last_sign_in_ip" DROP NOT NULL,
ALTER COLUMN "confirmation_token" DROP NOT NULL,
ALTER COLUMN "confirmed_at" DROP NOT NULL,
ALTER COLUMN "confirmation_sent_at" DROP NOT NULL,
ALTER COLUMN "unconfirmed_email" DROP NOT NULL,
ALTER COLUMN "failed_attempts" DROP NOT NULL,
ALTER COLUMN "unlock_token" DROP NOT NULL,
ALTER COLUMN "locked_at" DROP NOT NULL,
ALTER COLUMN "is_deleted" DROP NOT NULL,
ALTER COLUMN "roleId" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "deleted_at" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_reset_password_token_key" ON "User"("reset_password_token");
