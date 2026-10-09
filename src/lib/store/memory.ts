import type { IngestionRunDraft, IngestionRunRecord, RateDraft, RateQuery, RateStore } from "@/lib/store/types";

function keyOf(row: Pick<RateDraft, "currencyCode" | "date" | "kind" | "provider">): string {
  return [row.currencyCode, row.date, row.kind, row.provider].join("|");
}

function matches(row: RateDraft, query: RateQuery = {}): boolean {
  if (query.currency && row.currencyCode !== query.currency) return false;
  if (query.currencies && !query.currencies.includes(row.currencyCode)) return false;
  if (query.kind && row.kind !== query.kind) return false;
  if (query.provider && row.provider !== query.provider) return false;
  if (query.from && row.date < query.from) return false;
  if (query.to && row.date > query.to) return false;
  return true;
}

export function createMemoryStore(initial: RateDraft[] = []): RateStore {
  const rates = new Map<string, RateDraft>(initial.map((row) => [keyOf(row), { ...row }]));
  const runs: IngestionRunRecord[] = [];

  return {
    async upsertRates(rows) {
      for (const row of rows) rates.set(keyOf(row), { ...row });
      return rows.length;
    },
    async findRates(query) {
      return [...rates.values()]
        .filter((row) => matches(row, query))
        .sort((a, b) => a.date.localeCompare(b.date) || a.currencyCode.localeCompare(b.currencyCode));
    },
    async countRates() {
      return rates.size;
    },
    async recordRun(run: IngestionRunDraft) {
      const now = new Date().toISOString();
      runs.unshift({
        ...run,
        id: `run-${runs.length + 1}`,
        startedAt: now,
        finishedAt: now,
      });
    },
    async listRuns(limit = 10) {
      return runs.slice(0, limit);
    },
  };
}
