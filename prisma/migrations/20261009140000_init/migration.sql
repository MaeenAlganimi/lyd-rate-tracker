-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "lydPerUnit" DECIMAL(20,8) NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "isDerived" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualAudit" (
    "id" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "lydPerUnit" DECIMAL(20,8) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rate_kind_provider_date_idx" ON "Rate"("kind", "provider", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Rate_currencyCode_date_kind_provider_key" ON "Rate"("currencyCode", "date", "kind", "provider");

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE CASCADE ON UPDATE CASCADE;
