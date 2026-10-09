import { z } from "zod";

import { isRealDate } from "@/lib/dates";
import { isPositiveRate, toRateString } from "@/lib/rates/decimal";

export const currencySchema = z.enum(["USD", "EUR", "GBP", "TRY", "EGP", "TND"]);
export const kindSchema = z.enum(["official", "parallel"]);
export const providerSchema = z.enum(["hmrc", "treasury", "cbl-feed", "manual", "sample"]);

const dateSchema = z.string().refine(isRealDate, "Use a real YYYY-MM-DD date.");

function one(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function readLatestQuery(url: URL) {
  return z
    .object({
      currency: currencySchema.optional(),
      kind: kindSchema.optional(),
      provider: providerSchema.optional(),
    })
    .parse({
      currency: one(url.searchParams.get("currency")),
      kind: one(url.searchParams.get("kind")),
      provider: one(url.searchParams.get("provider")),
    });
}

export function readHistoryQuery(url: URL) {
  return z
    .object({
      currency: currencySchema,
      kind: kindSchema.default("official"),
      provider: providerSchema.optional(),
      from: dateSchema.optional(),
      to: dateSchema.optional(),
    })
    .refine((query) => !query.from || !query.to || query.from <= query.to, {
      message: "`from` must be on or before `to`.",
    })
    .parse({
      currency: one(url.searchParams.get("currency")),
      kind: one(url.searchParams.get("kind")),
      provider: one(url.searchParams.get("provider")),
      from: one(url.searchParams.get("from")),
      to: one(url.searchParams.get("to")),
    });
}

export function readCompareQuery(url: URL) {
  return z
    .object({
      currency: currencySchema.default("USD"),
      officialProvider: z.enum(["hmrc", "treasury", "cbl-feed", "manual"]).default("hmrc"),
      parallelProvider: z.enum(["sample", "manual"]).default("sample"),
      from: dateSchema.optional(),
      to: dateSchema.optional(),
    })
    .refine((query) => !query.from || !query.to || query.from <= query.to, {
      message: "`from` must be on or before `to`.",
    })
    .parse({
      currency: one(url.searchParams.get("currency")),
      officialProvider: one(url.searchParams.get("officialProvider")),
      parallelProvider: one(url.searchParams.get("parallelProvider")),
      from: one(url.searchParams.get("from")),
      to: one(url.searchParams.get("to")),
    });
}

export const manualRateSchema = z.object({
  currency: currencySchema,
  date: dateSchema,
  kind: kindSchema,
  lydPerUnit: z.union([z.string(), z.number()]).transform((value) => toRateString(value)),
  note: z.string().trim().max(500).optional(),
}).refine((body) => isPositiveRate(body.lydPerUnit), {
  message: "lydPerUnit must be a positive number.",
  path: ["lydPerUnit"],
});
