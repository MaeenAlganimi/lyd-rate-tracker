import { connection } from "next/server";
import { z } from "zod";

import { currencySchema } from "@/lib/api/schemas";
import { shiftMonths } from "@/lib/dates";
import { alignSeries } from "@/lib/rates/select";
import { spread } from "@/lib/rates/spread";
import { prismaStore } from "@/lib/store/prisma";
import type { IngestionRunRecord, RateDraft } from "@/lib/store/types";

const rangeSchema = z.enum(["1y", "2y", "all"]);
const officialSchema = z.enum(["hmrc", "treasury", "manual", "cbl-feed"]);
const parallelSchema = z.enum(["sample", "manual"]);

export type DashboardQuery = {
  currency: z.infer<typeof currencySchema>;
  range: z.infer<typeof rangeSchema>;
  official: z.infer<typeof officialSchema>;
  parallel: z.infer<typeof parallelSchema>;
};

type Search = Record<string, string | string[] | undefined>;

function pick(search: Search, key: string): string | undefined {
  const value = search[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseDashboardQuery(search: Search): DashboardQuery {
  const currency = currencySchema.safeParse(pick(search, "currency"));
  const range = rangeSchema.safeParse(pick(search, "range") ?? "2y");
  const official = officialSchema.safeParse(pick(search, "official") ?? "hmrc");
  const parallel = parallelSchema.safeParse(pick(search, "parallel") ?? "sample");
  return {
    currency: currency.success ? currency.data : "USD",
    range: range.success ? range.data : "2y",
    official: official.success ? official.data : "hmrc",
    parallel: parallel.success ? parallel.data : "sample",
  };
}

export type Tile = {
  currency: string;
  official: RateDraft | null;
  parallel: RateDraft | null;
  absolute: string | null;
  percent: string | null;
};

export type DashboardReady = {
  status: "ready";
  query: DashboardQuery;
  tiles: Tile[];
  hero: Tile;
  points: ReturnType<typeof alignSeries>;
  runs: IngestionRunRecord[];
};

export type DashboardState =
  | DashboardReady
  | { status: "empty"; query: DashboardQuery }
  | { status: "offline"; query: DashboardQuery };

function lastByCurrency(rows: RateDraft[]): Map<string, RateDraft> {
  const map = new Map<string, RateDraft>();
  for (const row of rows) {
    const current = map.get(row.currencyCode);
    if (!current || row.date > current.date) map.set(row.currencyCode, row);
  }
  return map;
}

export async function loadDashboard(search: Search): Promise<DashboardState> {
  await connection();
  const query = parseDashboardQuery(search);
  try {
    if ((await prismaStore.countRates()) === 0) return { status: "empty", query };

    const [officialRows, parallelRows, runs] = await Promise.all([
      prismaStore.findRates({ kind: "official", provider: query.official }),
      prismaStore.findRates({ kind: "parallel", provider: query.parallel }),
      prismaStore.listRuns(4),
    ]);

    const officialLatest = lastByCurrency(officialRows);
    const parallelLatest = lastByCurrency(parallelRows);
    const codes = ["USD", "EUR", "GBP", "TRY", "EGP", "TND"];
    const tiles: Tile[] = codes.map((currency) => {
      const official = officialLatest.get(currency) ?? null;
      const sameDay =
        official === null
          ? null
          : (parallelRows.find((row) => row.currencyCode === currency && row.date === official.date) ?? null);
      const parallel = sameDay ?? parallelLatest.get(currency) ?? null;
      const gap = official && sameDay ? spread(official.lydPerUnit, sameDay.lydPerUnit) : null;
      return {
        currency,
        official,
        parallel,
        absolute: gap?.absolute ?? null,
        percent: gap?.percent ?? null,
      };
    });

    const aligned = alignSeries(
      officialRows.filter((row) => row.currencyCode === query.currency),
      parallelRows.filter((row) => row.currencyCode === query.currency),
    );
    const latestDate = aligned.filter((point) => point.official || point.parallel).at(-1)?.date;
    const start =
      latestDate && query.range === "1y"
        ? shiftMonths(latestDate, -12)
        : latestDate && query.range === "2y"
          ? shiftMonths(latestDate, -24)
          : undefined;
    const points = start ? aligned.filter((point) => point.date >= start) : aligned;
    const hero = tiles.find((tile) => tile.currency === query.currency) ?? tiles[0];

    return { status: "ready", query, tiles, hero, points, runs };
  } catch {
    return { status: "offline", query };
  }
}

export function dashboardHref(
  locale: string,
  query: DashboardQuery,
  patch: Partial<DashboardQuery> = {},
): string {
  const next = { ...query, ...patch };
  const params = new URLSearchParams({
    currency: next.currency,
    range: next.range,
    official: next.official,
    parallel: next.parallel,
  });
  return `/${locale}?${params.toString()}`;
}
