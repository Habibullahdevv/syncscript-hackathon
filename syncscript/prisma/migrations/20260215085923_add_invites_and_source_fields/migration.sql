/*
  Warnings:

  - Added the required column `createdById` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "details" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "content" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Vault" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "VaultInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "usedBy" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaultInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaultInvite_token_key" ON "VaultInvite"("token");

-- CreateIndex
CREATE INDEX "VaultInvite_vaultId_idx" ON "VaultInvite"("vaultId");

-- CreateIndex
CREATE INDEX "VaultInvite_token_idx" ON "VaultInvite"("token");

-- CreateIndex
CREATE INDEX "AuditLog_vaultId_createdAt_idx" ON "AuditLog"("vaultId", "createdAt");

-- CreateIndex
CREATE INDEX "Source_createdById_idx" ON "Source"("createdById");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultInvite" ADD CONSTRAINT "VaultInvite_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultInvite" ADD CONSTRAINT "VaultInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultInvite" ADD CONSTRAINT "VaultInvite_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
