import { bearerToken, tokensMatch } from "@/lib/auth";
import { fail, invalid, json } from "@/lib/api/http";
import { presentPoint, presentRate } from "@/lib/api/present";
import { manualRateSchema, readCompareQuery, readHistoryQuery, readLatestQuery } from "@/lib/api/schemas";
import { readConfig, type AppConfig } from "@/lib/config";
import { CURRENCIES } from "@/lib/currencies";
import { runIngestion, type FetchText } from "@/lib/ingestion/run";
import { PROVIDER_CATALOG } from "@/lib/providers/catalog";
import { alignSeries, selectLatest } from "@/lib/rates/select";
import { spread } from "@/lib/rates/spread";
import type { RateStore } from "@/lib/store/types";

export async function handleLatest(request: Request, store: RateStore): Promise<Response> {
  const url = new URL(request.url);
  try {
    const query = readLatestQuery(url);
    const rows = await store.findRates({
      currency: query.currency,
      kind: query.kind,
      provider: query.provider,
    });
    const latest = selectLatest(rows);
    return json({
      base: "LYD",
      quoteConvention: "lyd_per_1_unit",
      demoMode: readConfig().demoMode,
      count: latest.length,
      rates: latest.map(presentRate),
    });
  } catch (error) {
    return invalid(error);
  }
}

export async function handleHistory(request: Request, store: RateStore): Promise<Response> {
  const url = new URL(request.url);
  try {
    const query = readHistoryQuery(url);
    const rows = await store.findRates(query);
    return json({
      base: "LYD",
      quoteConvention: "lyd_per_1_unit",
      currency: query.currency,
      kind: query.kind,
      provider: query.provider ?? null,
      count: rows.length,
      rates: rows.map(presentRate),
    });
  } catch (error) {
    return invalid(error);
  }
}

export async function handleCompare(request: Request, store: RateStore): Promise<Response> {
  const url = new URL(request.url);
  try {
    const query = readCompareQuery(url);
    const [official, parallel] = await Promise.all([
      store.findRates({
        currency: query.currency,
        kind: "official",
        provider: query.officialProvider,
        from: query.from,
        to: query.to,
      }),
      store.findRates({
        currency: query.currency,
        kind: "parallel",
        provider: query.parallelProvider,
        from: query.from,
        to: query.to,
      }),
    ]);
    const points = alignSeries(official, parallel).map(presentPoint);
    const paired = points.filter((point) => point.spreadPercent !== null);
    const latest = paired.at(-1) ?? null;
    return json({
      base: "LYD",
      quoteConvention: "lyd_per_1_unit",
      currency: query.currency,
      officialProvider: query.officialProvider,
      parallelProvider: query.parallelProvider,
      sampleParallel: query.parallelProvider === "sample",
      count: points.length,
      latestSpread: latest
        ? { date: latest.date, absolute: latest.spreadAbsolute, percent: latest.spreadPercent }
        : null,
      points,
    });
  } catch (error) {
    return invalid(error);
  }
}

export function handleCurrencies(): Response {
  return json({
    base: "LYD",
    quoteConvention: "lyd_per_1_unit",
    currencies: CURRENCIES.map((currency) => ({
      code: currency.code,
      name: { en: currency.nameEn, ar: currency.nameAr },
      symbol: currency.symbol,
    })),
  });
}

export function handleSources(config: AppConfig = readConfig()): Response {
  return json({
    demoMode: config.demoMode,
    ingestLive: config.ingestLive,
    cblFeedConfigured: Boolean(config.cblFeedUrl),
    providers: PROVIDER_CATALOG.map((entry) => ({
      ...entry,
      active: entry.id === "cbl-feed" ? Boolean(config.cblFeedUrl) : true,
    })),
    notScraped: [
      {
        name: "Central Bank of Libya exchange-rate page",
        url: "https://cbl.gov.ly/en/currency-exchange-rates/",
        reason:
          "CBL publishes the domestic fixing on its website but does not offer a public exchange-rate API or a reuse licence for that table. This app does not scrape it.",
      },
    ],
  });
}

export async function handleHealth(
  request: Request,
  ping: () => Promise<boolean>,
  config: AppConfig = readConfig(),
): Promise<Response> {
  const url = new URL(request.url);
  void url.pathname;
  const database = await ping();
  return json(
    {
      ok: database,
      service: "sarf",
      demoMode: config.demoMode,
      database: database ? "up" : "down",
    },
    database ? 200 : 503,
    { "cache-control": "no-store" },
  );
}

export async function handleManualRate(
  request: Request,
  store: RateStore,
  config: AppConfig = readConfig(),
): Promise<Response> {
  if (!config.adminToken) {
    return fail(401, "unauthorized", "Manual entry is disabled until ADMIN_TOKEN is set.");
  }
  const provided = bearerToken(request);
  if (!provided || !tokensMatch(provided, config.adminToken)) {
    return fail(401, "unauthorized", "A valid bearer token is required.");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail(400, "invalid_query", "The body must be JSON.");
  }

  try {
    const body = manualRateSchema.parse(payload);
    const row = {
      currencyCode: body.currency,
      date: body.date,
      kind: body.kind,
      provider: "manual",
      lydPerUnit: body.lydPerUnit,
      isSample: false,
      isDerived: false,
      note: body.note || "Manual entry.",
    };
    await store.upsertRates([row]);
    return json({ rate: presentRate(row), spread: null }, 201, { "cache-control": "no-store" });
  } catch (error) {
    return invalid(error);
  }
}

export async function handleIngest(
  request: Request,
  store: RateStore,
  config: AppConfig = readConfig(),
  fetchText?: FetchText,
): Promise<Response> {
  const url = new URL(request.url);
  void url.pathname;
  if (config.cronSecret) {
    const provided = bearerToken(request);
    if (!provided || !tokensMatch(provided, config.cronSecret)) {
      return fail(401, "unauthorized", "Cron requests need the CRON_SECRET bearer token.");
    }
  } else if (!config.demoMode) {
    return fail(401, "unauthorized", "Set CRON_SECRET before running ingestion outside demo mode.");
  }

  const report = await runIngestion({ store, config, fetchText });
  return json(report, 200, { "cache-control": "no-store" });
}

export function compareSpread(official: string, parallel: string) {
  return spread(official, parallel);
}
