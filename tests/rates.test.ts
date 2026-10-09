import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseCblFeed } from "@/lib/providers/cbl-feed";
import { parseHmrcXml } from "@/lib/providers/hmrc";
import { parseTreasuryPayload } from "@/lib/providers/treasury";
import { divideRates, invertRate } from "@/lib/rates/decimal";
import { applySamplePremium, buildSampleRates, premiumForDate } from "@/lib/rates/sample";
import { alignSeries, selectLatest } from "@/lib/rates/select";
import { spread } from "@/lib/rates/spread";
import type { RateDraft } from "@/lib/store/types";

const fixture = (name: string) => readFileSync(path.join(process.cwd(), "data/fixtures", name), "utf8");

describe("rate arithmetic", () => {
  it("divides and inverts without binary float drift", () => {
    expect(divideRates("8.5487", "1.3456")).toBe("6.353077");
    expect(invertRate("6.353077")).toBe("0.157404");
  });

  it("measures the parallel premium against the official rate", () => {
    expect(spread("6.000000", "7.200000")).toEqual({
      absolute: "1.200000",
      percent: "20.0000",
    });
    expect(spread("0.000000", "1.000000")).toBeNull();
  });
});

describe("HMRC parser", () => {
  const rows = parseHmrcXml(fixture("hmrc-2026-10.xml"));

  it("reads the October 2026 sterling file into dinars per unit", () => {
    expect(rows).toHaveLength(6);
    expect(rows.find((row) => row.currencyCode === "GBP")).toMatchObject({
      date: "2026-10-01",
      lydPerUnit: "8.548700",
      isDerived: false,
      isSample: false,
      provider: "hmrc",
      kind: "official",
    });
    expect(rows.find((row) => row.currencyCode === "USD")?.lydPerUnit).toBe("6.353077");
    expect(rows.find((row) => row.currencyCode === "EUR")?.lydPerUnit).toBe("7.328504");
    expect(rows.find((row) => row.currencyCode === "TRY")?.lydPerUnit).toBe("0.130583");
    expect(rows.find((row) => row.currencyCode === "EGP")?.lydPerUnit).toBe("0.121987");
    expect(rows.find((row) => row.currencyCode === "TND")?.lydPerUnit).toBe("2.169831");
    expect(rows.filter((row) => row.currencyCode !== "GBP").every((row) => row.isDerived)).toBe(true);
  });
});

describe("Treasury parser", () => {
  it("keeps the Libya-Dinar figure and crosses the other currencies", () => {
    const rows = parseTreasuryPayload(JSON.parse(fixture("treasury-2026-q2-q3.json")));
    const september = rows.filter((row) => row.date === "2026-09-30");
    expect(september).toHaveLength(6);
    expect(september.find((row) => row.currencyCode === "USD")).toMatchObject({
      lydPerUnit: "6.380000",
      isDerived: false,
      provider: "treasury",
    });
    expect(september.find((row) => row.currencyCode === "EUR")?.lydPerUnit).toBe("7.241771");
    expect(september.find((row) => row.currencyCode === "GBP")?.lydPerUnit).toBe("8.484043");
    expect(september.find((row) => row.currencyCode === "TRY")?.lydPerUnit).toBe("0.130201");
    expect(september.find((row) => row.currencyCode === "EGP")?.lydPerUnit).toBe("0.122952");
    expect(september.find((row) => row.currencyCode === "TND")?.lydPerUnit).toBe("2.145259");
  });
});

describe("parallel sample", () => {
  it("applies a deterministic premium and labels every row as sample", () => {
    expect(premiumForDate("2024-01-01")).toBe("0.1100");
    expect(applySamplePremium("6.353077", "2026-10-01")).toBe("7.496600");
    const official: RateDraft = {
      currencyCode: "USD",
      date: "2026-10-01",
      kind: "official",
      provider: "hmrc",
      lydPerUnit: "6.353077",
      isSample: false,
      isDerived: true,
      note: null,
    };
    const [sample] = buildSampleRates([official, { ...official, provider: "treasury" }]);
    expect(sample).toMatchObject({
      provider: "sample",
      kind: "parallel",
      isSample: true,
      lydPerUnit: "7.496600",
    });
    expect(sample.note).toContain("SAMPLE DATA");
  });

  it("uses the same premium for every currency in a month", () => {
    const rows = ["USD", "EUR"].map(
      (currencyCode): RateDraft => ({
        currencyCode,
        date: "2025-06-01",
        kind: "official",
        provider: "hmrc",
        lydPerUnit: currencyCode === "USD" ? "5.000000" : "6.000000",
        isSample: false,
        isDerived: true,
        note: null,
      }),
    );
    const sample = buildSampleRates(rows);
    const ratios = sample.map((row) => Number(row.lydPerUnit) / Number(rows.find((item) => item.currencyCode === row.currencyCode)!.lydPerUnit));
    expect(ratios[0]).toBeCloseTo(ratios[1], 6);
  });
});

describe("series selection", () => {
  const rows: RateDraft[] = [
    draft("USD", "2026-09-30", "official", "treasury", "6.380000"),
    draft("USD", "2026-10-01", "official", "hmrc", "6.353077"),
    draft("USD", "2026-10-01", "official", "manual", "6.428700"),
    draft("USD", "2026-10-01", "parallel", "sample", "7.496600", true),
  ];

  it("prefers a same-day manual fixing over the published reference", () => {
    const latest = selectLatest(rows);
    expect(latest.find((row) => row.kind === "official")?.provider).toBe("manual");
    expect(latest.find((row) => row.kind === "parallel")?.isSample).toBe(true);
  });

  it("aligns official and parallel dates and leaves gaps empty", () => {
    const points = alignSeries(
      rows.filter((row) => row.kind === "official" && row.provider === "hmrc"),
      rows.filter((row) => row.kind === "parallel"),
    );
    expect(points).toEqual([
      expect.objectContaining({ date: "2026-10-01", official: "6.353077", parallel: "7.496600" }),
    ]);
  });
});

describe("optional CBL feed", () => {
  it("accepts an operator-supplied JSON feed and refuses a bad date", () => {
    const rows = parseCblFeed([
      { date: "2026-10-08", currency: "USD", lydPerUnit: "6.4287", note: "CBL mid, transcribed by hand" },
    ]);
    expect(rows[0]).toMatchObject({ provider: "cbl-feed", lydPerUnit: "6.428700", isSample: false });
    expect(() => parseCblFeed([{ date: "2026-02-31", currency: "USD", lydPerUnit: "6" }])).toThrow(/calendar/);
  });
});

function draft(
  currencyCode: string,
  date: string,
  kind: RateDraft["kind"],
  provider: string,
  lydPerUnit: string,
  isSample = false,
): RateDraft {
  return {
    currencyCode,
    date,
    kind,
    provider,
    lydPerUnit,
    isSample,
    isDerived: provider !== "manual",
    note: null,
  };
}
