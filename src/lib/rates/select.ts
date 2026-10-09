import { OFFICIAL_PREFERENCE, PARALLEL_PREFERENCE } from "@/lib/providers/catalog";
import type { RateDraft, RateKind } from "@/lib/store/types";

function preference(kind: RateKind): readonly string[] {
  return kind === "official" ? OFFICIAL_PREFERENCE : PARALLEL_PREFERENCE;
}

function rank(kind: RateKind, provider: string): number {
  const index = preference(kind).indexOf(provider);
  return index === -1 ? preference(kind).length : index;
}

export function selectLatest(rows: RateDraft[]): RateDraft[] {
  const groups = new Map<string, RateDraft[]>();
  for (const row of rows) {
    const key = `${row.currencyCode}:${row.kind}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  const selected: RateDraft[] = [];
  for (const bucket of groups.values()) {
    const latestDate = bucket.reduce((max, row) => (row.date > max ? row.date : max), bucket[0].date);
    const onDate = bucket.filter((row) => row.date === latestDate);
    onDate.sort((a, b) => rank(a.kind, a.provider) - rank(b.kind, b.provider));
    selected.push(onDate[0]);
  }

  return selected.sort((a, b) => a.currencyCode.localeCompare(b.currencyCode) || a.kind.localeCompare(b.kind));
}

export type ComparePoint = {
  date: string;
  official: string | null;
  parallel: string | null;
  officialProvider: string | null;
  parallelProvider: string | null;
  officialSample: boolean;
  parallelSample: boolean;
};

export function alignSeries(official: RateDraft[], parallel: RateDraft[]): ComparePoint[] {
  const dates = new Set<string>();
  const officialByDate = new Map(official.map((row) => [row.date, row]));
  const parallelByDate = new Map(parallel.map((row) => [row.date, row]));
  for (const row of official) dates.add(row.date);
  for (const row of parallel) dates.add(row.date);

  return [...dates].sort().map((date) => {
    const left = officialByDate.get(date) ?? null;
    const right = parallelByDate.get(date) ?? null;
    return {
      date,
      official: left?.lydPerUnit ?? null,
      parallel: right?.lydPerUnit ?? null,
      officialProvider: left?.provider ?? null,
      parallelProvider: right?.provider ?? null,
      officialSample: left?.isSample ?? false,
      parallelSample: right?.isSample ?? false,
    };
  });
}
