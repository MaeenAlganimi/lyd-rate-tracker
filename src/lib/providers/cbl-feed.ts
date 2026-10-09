import { z } from "zod";

import { isRealDate } from "@/lib/dates";
import { isPositiveRate, toRateString } from "@/lib/rates/decimal";
import type { RateDraft } from "@/lib/store/types";

export const CBL_FEED_PROVIDER = "cbl-feed";

const feedRow = z.object({
  date: z.string(),
  currency: z.enum(["USD", "EUR", "GBP", "TRY", "EGP", "TND"]),
  lydPerUnit: z.union([z.string(), z.number()]),
  note: z.string().max(500).optional(),
});

export function parseCblFeed(payload: unknown): RateDraft[] {
  const rows = z.array(feedRow).parse(payload);
  return rows.map((row) => {
    const lydPerUnit = toRateString(row.lydPerUnit);
    if (!isRealDate(row.date)) throw new Error(`CBL feed date is not a real calendar date: ${row.date}`);
    if (!isPositiveRate(lydPerUnit)) throw new Error(`CBL feed rate must be positive for ${row.currency}.`);
    return {
      currencyCode: row.currency,
      date: row.date,
      kind: "official" as const,
      provider: CBL_FEED_PROVIDER,
      lydPerUnit,
      isSample: false,
      isDerived: false,
      note: row.note?.trim() || "Operator-supplied CBL feed. Sarf does not scrape cbl.gov.ly.",
    };
  });
}
