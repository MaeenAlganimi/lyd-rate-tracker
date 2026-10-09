import Decimal from "decimal.js";

import type { Locale } from "@/lib/i18n/locale";

export function formatRate(value: string | null, digits = 4): string {
  if (!value) return "—";
  return new Decimal(value).toFixed(digits);
}

export function formatSigned(value: string | null, digits = 4): string {
  if (!value) return "—";
  const decimal = new Decimal(value);
  const text = decimal.toFixed(digits);
  return decimal.isNeg() ? text : `+${text}`;
}

export function formatPercent(value: string | null): string {
  if (!value) return "—";
  const decimal = new Decimal(value);
  const text = decimal.toFixed(2);
  return `${decimal.isNeg() ? "" : "+"}${text}%`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LY-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00.000Z`));
}
