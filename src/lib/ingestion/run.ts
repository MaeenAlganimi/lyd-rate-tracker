import { readConfig, type AppConfig } from "@/lib/config";
import { previousMonth } from "@/lib/dates";
import { parseCblFeed } from "@/lib/providers/cbl-feed";
import { hmrcFileUrl, parseHmrcXml } from "@/lib/providers/hmrc";
import { parseTreasuryPayload, treasuryHistoryUrl } from "@/lib/providers/treasury";
import { buildSampleRates } from "@/lib/rates/sample";
import type { RateStore } from "@/lib/store/types";

export type IngestionReport = {
  live: boolean;
  providers: Array<{ provider: string; status: string; rowCount: number; message?: string }>;
};

export type FetchText = (url: string) => Promise<{ status: number; body: string }>;

export async function defaultFetchText(url: string): Promise<{ status: number; body: string }> {
  const response = await fetch(url, {
    headers: {
      accept: "application/xml, application/json, text/xml, */*",
      "user-agent": "sarf-lyd-tracker/1.0 (rate ingestion; licensed public data)",
    },
    signal: AbortSignal.timeout(20_000),
  });
  return { status: response.status, body: await response.text() };
}

function monthPair(now: Date): Array<{ year: number; month: number }> {
  const current = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  return [previousMonth(current.year, current.month), current];
}

export async function runIngestion(options: {
  store: RateStore;
  config?: AppConfig;
  now?: Date;
  fetchText?: FetchText;
}): Promise<IngestionReport> {
  const config = options.config ?? readConfig();
  const now = options.now ?? new Date();
  const fetchText = options.fetchText ?? defaultFetchText;
  const providers: IngestionReport["providers"] = [];

  if (config.ingestLive) {
    for (const period of monthPair(now)) {
      const url = hmrcFileUrl(period.year, period.month);
      try {
        const response = await fetchText(url);
        if (response.status === 404) {
          providers.push({ provider: "hmrc", status: "missing", rowCount: 0, message: url });
          continue;
        }
        if (response.status >= 400) {
          throw new Error(`HMRC responded ${response.status} for ${url}`);
        }
        const rows = parseHmrcXml(response.body);
        const rowCount = await options.store.upsertRates(rows);
        await options.store.recordRun({ provider: "hmrc", status: "ok", rowCount, message: rows[0]?.date });
        providers.push({ provider: "hmrc", status: "ok", rowCount, message: rows[0]?.date });
      } catch (error) {
        const message = error instanceof Error ? error.message : "HMRC ingestion failed.";
        await options.store.recordRun({ provider: "hmrc", status: "error", rowCount: 0, message });
        providers.push({ provider: "hmrc", status: "error", rowCount: 0, message });
      }
    }

    try {
      const response = await fetchText(treasuryHistoryUrl());
      if (response.status >= 400) throw new Error(`Treasury responded ${response.status}.`);
      const rows = parseTreasuryPayload(JSON.parse(response.body) as unknown);
      const rowCount = await options.store.upsertRates(rows);
      await options.store.recordRun({ provider: "treasury", status: "ok", rowCount });
      providers.push({ provider: "treasury", status: "ok", rowCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Treasury ingestion failed.";
      await options.store.recordRun({ provider: "treasury", status: "error", rowCount: 0, message });
      providers.push({ provider: "treasury", status: "error", rowCount: 0, message });
    }

    if (config.cblFeedUrl) {
      try {
        const response = await fetchText(config.cblFeedUrl);
        if (response.status >= 400) throw new Error(`CBL feed responded ${response.status}.`);
        const rows = parseCblFeed(JSON.parse(response.body) as unknown);
        const rowCount = await options.store.upsertRates(rows);
        await options.store.recordRun({ provider: "cbl-feed", status: "ok", rowCount });
        providers.push({ provider: "cbl-feed", status: "ok", rowCount });
      } catch (error) {
        const message = error instanceof Error ? error.message : "CBL feed ingestion failed.";
        await options.store.recordRun({ provider: "cbl-feed", status: "error", rowCount: 0, message });
        providers.push({ provider: "cbl-feed", status: "error", rowCount: 0, message });
      }
    }
  } else {
    providers.push({
      provider: "live",
      status: "skipped",
      rowCount: 0,
      message: "INGEST_LIVE is false. No upstream request was made.",
    });
  }

  const official = await options.store.findRates({ kind: "official", provider: "hmrc" });
  const sample = buildSampleRates(official);
  const rowCount = await options.store.upsertRates(sample);
  await options.store.recordRun({
    provider: "sample",
    status: "ok",
    rowCount,
    message: "SAMPLE DATA regenerated from stored HMRC rows.",
  });
  providers.push({ provider: "sample", status: "ok", rowCount, message: "SAMPLE DATA" });

  return { live: config.ingestLive, providers };
}
