-- CreateEnum
CREATE TYPE "BrokerProvider" AS ENUM ('TRADOVATE');

-- CreateEnum
CREATE TYPE "BrokerEnvironment" AS ENUM ('DEMO', 'LIVE');

-- CreateEnum
CREATE TYPE "BrokerConnectionStatus" AS ENUM ('CONNECTED', 'NEEDS_REAUTH', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "BrokerSyncJobStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "BrokerConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "BrokerProvider" NOT NULL,
    "environment" "BrokerEnvironment" NOT NULL DEFAULT 'LIVE',
    "status" "BrokerConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "externalUserId" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastTokenRefreshAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "provider" "BrokerProvider" NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountSpec" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerSyncJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "accountId" TEXT,
    "provider" "BrokerProvider" NOT NULL,
    "status" "BrokerSyncJobStatus" NOT NULL DEFAULT 'PROCESSING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rowsFound" INTEGER NOT NULL DEFAULT 0,
    "rowsImported" INTEGER NOT NULL DEFAULT 0,
    "rowsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB,

    CONSTRAINT "BrokerSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrokerConnection_userId_provider_environment_key" ON "BrokerConnection"("userId", "provider", "environment");

-- CreateIndex
CREATE INDEX "BrokerConnection_provider_status_expiresAt_idx" ON "BrokerConnection"("provider", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerAccount_connectionId_externalAccountId_key" ON "BrokerAccount"("connectionId", "externalAccountId");

-- CreateIndex
CREATE INDEX "BrokerAccount_userId_provider_enabled_idx" ON "BrokerAccount"("userId", "provider", "enabled");

-- CreateIndex
CREATE INDEX "BrokerSyncJob_userId_provider_startedAt_idx" ON "BrokerSyncJob"("userId", "provider", "startedAt");

-- CreateIndex
CREATE INDEX "BrokerSyncJob_connectionId_startedAt_idx" ON "BrokerSyncJob"("connectionId", "startedAt");

-- AddForeignKey
ALTER TABLE "BrokerConnection" ADD CONSTRAINT "BrokerConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAccount" ADD CONSTRAINT "BrokerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAccount" ADD CONSTRAINT "BrokerAccount_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BrokerConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerSyncJob" ADD CONSTRAINT "BrokerSyncJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerSyncJob" ADD CONSTRAINT "BrokerSyncJob_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BrokerConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerSyncJob" ADD CONSTRAINT "BrokerSyncJob_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BrokerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
