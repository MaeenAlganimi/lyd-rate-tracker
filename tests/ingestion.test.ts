import { describe, expect, it, vi } from "vitest";

import { readConfig } from "@/lib/config";
import { runIngestion } from "@/lib/ingestion/run";
import { parseHmrcXml } from "@/lib/providers/hmrc";
import { createMemoryStore } from "@/lib/store/memory";
import { readFileSync } from "node:fs";
import path from "node:path";

const october = readFileSync(path.join(process.cwd(), "data/fixtures/hmrc-2026-10.xml"), "utf8");

describe("ingestion", () => {
  it("does not call the network when live ingestion is off, and still labels the sample", async () => {
    const store = createMemoryStore(parseHmrcXml(october));
    const fetchText = vi.fn();
    const report = await runIngestion({
      store,
      config: readConfig({ DEMO_MODE: "true", INGEST_LIVE: "false" }),
      fetchText,
    });

    expect(fetchText).not.toHaveBeenCalled();
    expect(report.live).toBe(false);
    const sample = await store.findRates({ provider: "sample", currency: "USD" });
    expect(sample).toHaveLength(1);
    expect(sample[0].isSample).toBe(true);
    expect(sample[0].lydPerUnit).toBe("7.496600");
  });

  it("is idempotent when the same HMRC file is ingested twice", async () => {
    const store = createMemoryStore();
    const fetchText = vi.fn(async (url: string) => {
      if (url.includes("monthly_xml_2026-10")) return { status: 200, body: october };
      if (url.includes("monthly_xml_2026-09")) return { status: 404, body: "" };
      if (url.includes("fiscaldata.treasury.gov")) {
        return { status: 200, body: JSON.stringify({ data: [] }) };
      }
      throw new Error(`unexpected url ${url}`);
    });

    const config = readConfig({ DEMO_MODE: "true", INGEST_LIVE: "true" });
    await runIngestion({ store, config, fetchText, now: new Date("2026-10-09T00:00:00Z") });
    await runIngestion({ store, config, fetchText, now: new Date("2026-10-09T00:00:00Z") });

    const official = await store.findRates({ provider: "hmrc" });
    expect(official).toHaveLength(6);
    expect(await store.countRates()).toBe(12);
  });
});
