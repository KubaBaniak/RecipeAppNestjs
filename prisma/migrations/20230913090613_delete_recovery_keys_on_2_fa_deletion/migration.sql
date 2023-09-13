-- DropForeignKey
ALTER TABLE "TwoFactorAuthRecoveryKey" DROP CONSTRAINT "TwoFactorAuthRecoveryKey_twoFactorAuthId_fkey";

-- AddForeignKey
ALTER TABLE "TwoFactorAuthRecoveryKey" ADD CONSTRAINT "TwoFactorAuthRecoveryKey_twoFactorAuthId_fkey" FOREIGN KEY ("twoFactorAuthId") REFERENCES "TwoFactorAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
