import Decimal from "decimal.js";

import { toRateString } from "@/lib/rates/decimal";
import type { RateDraft } from "@/lib/store/types";

/**
 * Repeating synthetic premium over the official rate.
 * Index 0 is January. The pattern is intentionally mechanical so a reader
 * can see that the parallel series is not a market feed.
 */
export const SAMPLE_PREMIUMS = [
  "0.1100",
  "0.1250",
  "0.1400",
  "0.1550",
  "0.1700",
  "0.1900",
  "0.2100",
  "0.2300",
  "0.2000",
  "0.1800",
  "0.1500",
  "0.1300",
] as const;

export const SAMPLE_PROVIDER = "sample";
export const SAMPLE_NOTE =
  "SAMPLE DATA. Synthetic premium applied to the HMRC official reference for the same month. Not a parallel-market quotation.";

export function premiumForDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) throw new Error(`Cannot build a sample premium for ${date}.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const index = (((year - 2023) * 12 + (month - 1)) % 12 + 12) % 12;
  return SAMPLE_PREMIUMS[index];
}

export function applySamplePremium(official: string, date: string): string {
  const premium = premiumForDate(date);
  const widened = new Decimal(official).mul(new Decimal(1).plus(premium));
  return toRateString(widened.toFixed(4));
}

export function buildSampleRates(officialRows: RateDraft[]): RateDraft[] {
  return officialRows
    .filter((row) => row.kind === "official" && row.provider === "hmrc")
    .map((row) => ({
      currencyCode: row.currencyCode,
      date: row.date,
      kind: "parallel" as const,
      provider: SAMPLE_PROVIDER,
      lydPerUnit: applySamplePremium(row.lydPerUnit, row.date),
      isSample: true,
      isDerived: true,
      note: SAMPLE_NOTE,
    }));
}
