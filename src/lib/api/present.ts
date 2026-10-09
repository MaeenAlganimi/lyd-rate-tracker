import { currencyByCode } from "@/lib/currencies";
import { catalogById } from "@/lib/providers/catalog";
import { invertRate } from "@/lib/rates/decimal";
import { spread } from "@/lib/rates/spread";
import type { ComparePoint } from "@/lib/rates/select";
import type { RateDraft } from "@/lib/store/types";

export function presentRate(row: RateDraft) {
  const currency = currencyByCode(row.currencyCode);
  const source = catalogById(row.provider);
  return {
    currency: row.currencyCode,
    name: currency ? { en: currency.nameEn, ar: currency.nameAr } : null,
    kind: row.kind,
    provider: row.provider,
    date: row.date,
    lydPerUnit: row.lydPerUnit,
    unitPerLyd: invertRate(row.lydPerUnit),
    quoteConvention: "lyd_per_1_unit" as const,
    isSample: row.isSample,
    isDerived: row.isDerived,
    note: row.note,
    licence: source?.licence ?? null,
    licenceUrl: source?.licenceUrl ?? null,
    sourceUrl: source?.sourceUrl ?? null,
  };
}

export function presentPoint(point: ComparePoint) {
  const gap = point.official && point.parallel ? spread(point.official, point.parallel) : null;
  return {
    date: point.date,
    official: point.official,
    parallel: point.parallel,
    officialProvider: point.officialProvider,
    parallelProvider: point.parallelProvider,
    officialSample: point.officialSample,
    parallelSample: point.parallelSample,
    spreadAbsolute: gap?.absolute ?? null,
    spreadPercent: gap?.percent ?? null,
  };
}
