import { loadEnvFile } from "node:process";

import { Prisma, PrismaClient } from "@prisma/client";

try {
  loadEnvFile();
} catch {
  // Next.js loads .env on its own, and CI may inject variables directly.
}

import { dateFromIso, isoDate } from "@/lib/dates";
import { toRateString } from "@/lib/rates/decimal";
import type { IngestionRunRecord, RateDraft, RateQuery, RateStore } from "@/lib/store/types";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function toDraft(row: {
  currencyCode: string;
  date: Date;
  kind: string;
  provider: string;
  lydPerUnit: Prisma.Decimal;
  isSample: boolean;
  isDerived: boolean;
  note: string | null;
}): RateDraft {
  return {
    currencyCode: row.currencyCode,
    date: isoDate(row.date),
    kind: row.kind === "parallel" ? "parallel" : "official",
    provider: row.provider,
    lydPerUnit: toRateString(row.lydPerUnit.toString()),
    isSample: row.isSample,
    isDerived: row.isDerived,
    note: row.note,
  };
}

export const prismaStore: RateStore = {
  async upsertRates(rows) {
    if (rows.length === 0) return 0;
    const chunkSize = 40;
    for (let index = 0; index < rows.length; index += chunkSize) {
      const chunk = rows.slice(index, index + chunkSize);
      await prisma.$transaction(
        chunk.map((row) =>
          prisma.rate.upsert({
          where: {
            currencyCode_date_kind_provider: {
              currencyCode: row.currencyCode,
              date: dateFromIso(row.date),
              kind: row.kind,
              provider: row.provider,
            },
          },
          create: {
            currencyCode: row.currencyCode,
            date: dateFromIso(row.date),
            kind: row.kind,
            provider: row.provider,
            lydPerUnit: row.lydPerUnit,
            isSample: row.isSample,
            isDerived: row.isDerived,
            note: row.note,
          },
          update: {
            lydPerUnit: row.lydPerUnit,
            isSample: row.isSample,
            isDerived: row.isDerived,
            note: row.note,
          },
        }),
        ),
      );
    }
    return rows.length;
  },

  async findRates(query: RateQuery = {}) {
    const currencies = query.currencies ?? (query.currency ? [query.currency] : undefined);
    const rows = await prisma.rate.findMany({
      where: {
        currencyCode: currencies ? { in: currencies } : undefined,
        kind: query.kind,
        provider: query.provider,
        date: {
          gte: query.from ? dateFromIso(query.from) : undefined,
          lte: query.to ? dateFromIso(query.to) : undefined,
        },
      },
      orderBy: [{ date: "asc" }, { currencyCode: "asc" }],
    });
    return rows.map(toDraft);
  },

  async countRates() {
    return prisma.rate.count();
  },

  async recordRun(run) {
    const now = new Date();
    await prisma.ingestionRun.create({
      data: {
        provider: run.provider,
        status: run.status,
        rowCount: run.rowCount,
        message: run.message,
        startedAt: now,
        finishedAt: now,
      },
    });
  },

  async listRuns(limit = 10) {
    const rows = await prisma.ingestionRun.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
    });
    return rows.map(
      (row): IngestionRunRecord => ({
        id: row.id,
        provider: row.provider,
        status: row.status,
        rowCount: row.rowCount,
        message: row.message ?? undefined,
        startedAt: row.startedAt.toISOString(),
        finishedAt: row.finishedAt?.toISOString() ?? null,
      }),
    );
  },
};
