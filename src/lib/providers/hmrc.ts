import { isCurrencyCode, type CurrencyCode } from "@/lib/currencies";
import { divideRates, toRateString } from "@/lib/rates/decimal";
import type { RateDraft } from "@/lib/store/types";

export const HMRC_PROVIDER = "hmrc";

export const HMRC_GBP_NOTE =
  "Published HMRC sterling rate: units of foreign currency per 1 GBP. LYD is quoted directly, so this figure is already dinars per pound.";

export const HMRC_DERIVED_NOTE =
  "Derived inside Sarf from one HMRC monthly file: LYD per 1 unit = (LYD per GBP) / (currency per GBP). Both legs are from that file. This is not an HMRC LYD fixing.";

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const QUOTED: CurrencyCode[] = ["USD", "EUR", "TRY", "EGP", "TND"];

export function hmrcFileUrl(year: number, month: number): string {
  const mm = String(month).padStart(2, "0");
  return `https://www.trade-tariff.service.gov.uk/api/v2/exchange_rates/files/monthly_xml_${year}-${mm}.xml`;
}

export function periodFromHmrcXml(xml: string): string | null {
  const match = /Period="01\/([A-Za-z]{3})\/(\d{4})/.exec(xml);
  if (!match) return null;
  const month = MONTHS[match[1]];
  if (!month) return null;
  return `${match[2]}-${month}-01`;
}

function readSterlingRates(xml: string): Map<string, string> {
  const rates = new Map<string, string>();
  for (const block of xml.matchAll(/<exchangeRate>([\s\S]*?)<\/exchangeRate>/g)) {
    const code = /<currencyCode>([A-Z]{3})<\/currencyCode>/.exec(block[1])?.[1];
    const rate = /<rateNew>([0-9]+(?:\.[0-9]+)?)<\/rateNew>/.exec(block[1])?.[1];
    if (code && rate) rates.set(code, rate);
  }
  return rates;
}

export function parseHmrcXml(xml: string): RateDraft[] {
  const date = periodFromHmrcXml(xml);
  if (!date) throw new Error("HMRC file is missing a recognisable Period attribute.");

  const rates = readSterlingRates(xml);
  const lydPerGbp = rates.get("LYD");
  if (!lydPerGbp) throw new Error("HMRC file is missing the LYD sterling rate.");

  const rows: RateDraft[] = [
    {
      currencyCode: "GBP",
      date,
      kind: "official",
      provider: HMRC_PROVIDER,
      lydPerUnit: toRateString(lydPerGbp),
      isSample: false,
      isDerived: false,
      note: HMRC_GBP_NOTE,
    },
  ];

  for (const code of QUOTED) {
    const perGbp = rates.get(code);
    if (!perGbp) throw new Error(`HMRC file is missing the ${code} sterling rate.`);
    if (!isCurrencyCode(code)) continue;
    rows.push({
      currencyCode: code,
      date,
      kind: "official",
      provider: HMRC_PROVIDER,
      lydPerUnit: divideRates(lydPerGbp, perGbp),
      isSample: false,
      isDerived: true,
      note: HMRC_DERIVED_NOTE,
    });
  }

  return rows;
}
