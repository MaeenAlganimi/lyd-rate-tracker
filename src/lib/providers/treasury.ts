import { isCurrencyCode, type CurrencyCode } from "@/lib/currencies";
import { divideRates, toRateString } from "@/lib/rates/decimal";
import type { RateDraft } from "@/lib/store/types";

export const TREASURY_PROVIDER = "treasury";

export const TREASURY_USD_NOTE =
  "U.S. Treasury reporting rate: foreign-currency units per 1 USD. Libya-Dinar is already dinars per dollar.";

export const TREASURY_DERIVED_NOTE =
  "Derived inside Sarf from U.S. Treasury reporting rates for the same quarter: LYD per 1 unit = (LYD per USD) / (units per USD).";

export const TREASURY_DESCRIPTIONS: Record<string, CurrencyCode | "LYD_PER_USD"> = {
  "Libya-Dinar": "LYD_PER_USD",
  "Euro Zone-Euro": "EUR",
  "United Kingdom-Pound": "GBP",
  "Turkey-New Lira": "TRY",
  "Egypt-Pound": "EGP",
  "Tunisia-Dinar": "TND",
};

export type TreasuryRawRow = {
  country_currency_desc: string;
  exchange_rate: string;
  record_date: string;
};

export function treasuryHistoryUrl(): string {
  const url = new URL(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
  );
  url.searchParams.set("fields", "country_currency_desc,exchange_rate,record_date");
  url.searchParams.set(
    "filter",
    "record_date:gte:2023-01-01,country_currency_desc:in:(Libya-Dinar,Egypt-Pound,Tunisia-Dinar,Turkey-New Lira,Euro Zone-Euro,United Kingdom-Pound)",
  );
  url.searchParams.set("sort", "record_date");
  url.searchParams.set("page[size]", "500");
  return url.toString();
}

export function parseTreasuryRows(rows: TreasuryRawRow[]): RateDraft[] {
  const byDate = new Map<string, Map<string, string>>();
  for (const row of rows) {
    const slot = TREASURY_DESCRIPTIONS[row.country_currency_desc];
    if (!slot || !row.record_date || !row.exchange_rate) continue;
    const bucket = byDate.get(row.record_date) ?? new Map<string, string>();
    bucket.set(slot, row.exchange_rate);
    byDate.set(row.record_date, bucket);
  }

  const drafts: RateDraft[] = [];
  for (const [date, bucket] of byDate) {
    const lydPerUsd = bucket.get("LYD_PER_USD");
    if (!lydPerUsd) continue;
    drafts.push({
      currencyCode: "USD",
      date,
      kind: "official",
      provider: TREASURY_PROVIDER,
      lydPerUnit: toRateString(lydPerUsd),
      isSample: false,
      isDerived: false,
      note: TREASURY_USD_NOTE,
    });
    for (const [code, perUsd] of bucket) {
      if (code === "LYD_PER_USD" || !isCurrencyCode(code)) continue;
      drafts.push({
        currencyCode: code,
        date,
        kind: "official",
        provider: TREASURY_PROVIDER,
        lydPerUnit: divideRates(lydPerUsd, perUsd),
        isSample: false,
        isDerived: true,
        note: TREASURY_DERIVED_NOTE,
      });
    }
  }

  return drafts.sort((a, b) => a.date.localeCompare(b.date) || a.currencyCode.localeCompare(b.currencyCode));
}

export function parseTreasuryPayload(payload: unknown): RateDraft[] {
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data)) {
    throw new Error("Treasury payload is missing a data array.");
  }
  const rows: TreasuryRawRow[] = [];
  for (const item of payload.data) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (
      typeof record.country_currency_desc === "string" &&
      typeof record.exchange_rate === "string" &&
      typeof record.record_date === "string"
    ) {
      rows.push({
        country_currency_desc: record.country_currency_desc,
        exchange_rate: record.exchange_rate,
        record_date: record.record_date,
      });
    }
  }
  return parseTreasuryRows(rows);
}
