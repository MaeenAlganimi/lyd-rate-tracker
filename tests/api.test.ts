import { describe, expect, it } from "vitest";

import { handleCompare, handleHistory, handleIngest, handleLatest, handleManualRate } from "@/lib/api/handlers";
import { readConfig } from "@/lib/config";
import { parseHmrcXml } from "@/lib/providers/hmrc";
import { buildSampleRates } from "@/lib/rates/sample";
import { createMemoryStore } from "@/lib/store/memory";
import { readFileSync } from "node:fs";
import path from "node:path";

const october = parseHmrcXml(readFileSync(path.join(process.cwd(), "data/fixtures/hmrc-2026-10.xml"), "utf8"));

function storeWithOctober() {
  return createMemoryStore([...october, ...buildSampleRates(october)]);
}

async function body(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("public API", () => {
  it("returns the latest official and sample parallel rates", async () => {
    const response = await handleLatest(new Request("http://sarf.local/api/v1/rates/latest?currency=USD"), storeWithOctober());
    expect(response.status).toBe(200);
    const payload = await body(response);
    const rates = payload.rates as Array<{ kind: string; provider: string; isSample: boolean; lydPerUnit: string }>;
    expect(rates).toHaveLength(2);
    expect(rates.find((rate) => rate.kind === "official")).toMatchObject({
      provider: "hmrc",
      lydPerUnit: "6.353077",
      isSample: false,
    });
    expect(rates.find((rate) => rate.kind === "parallel")?.isSample).toBe(true);
  });

  it("rejects an unknown currency and a reversed range", async () => {
    const store = storeWithOctober();
    expect((await handleHistory(new Request("http://sarf.local/api/v1/rates/history?currency=XXX"), store)).status).toBe(400);
    expect(
      (await handleHistory(new Request("http://sarf.local/api/v1/rates/history?currency=USD&from=2026-10-02&to=2026-01-01"), store))
        .status,
    ).toBe(400);
  });

  it("computes the compare spread for the sample series", async () => {
    const response = await handleCompare(
      new Request("http://sarf.local/api/v1/rates/compare?currency=USD"),
      storeWithOctober(),
    );
    const payload = await body(response);
    expect(payload.sampleParallel).toBe(true);
    expect(payload.latestSpread).toMatchObject({ date: "2026-10-01", absolute: "1.143523" });
    const points = payload.points as Array<{ parallelSample: boolean }>;
    expect(points.every((point) => point.parallelSample)).toBe(true);
  });

  it("requires the admin token and then stores a manual rate", async () => {
    const store = storeWithOctober();
    const config = readConfig({ DEMO_MODE: "false", ADMIN_TOKEN: "desk-token" });
    const url = "http://sarf.local/api/admin/rates";
    const denied = await handleManualRate(new Request(url, { method: "POST", body: "{}" }), store, config);
    expect(denied.status).toBe(401);

    const created = await handleManualRate(
      new Request(url, {
        method: "POST",
        headers: { authorization: "Bearer desk-token", "content-type": "application/json" },
        body: JSON.stringify({ currency: "USD", date: "2026-10-08", kind: "official", lydPerUnit: "6.4287", note: "CBL mid" }),
      }),
      store,
      config,
    );
    expect(created.status).toBe(201);
    const latest = await body(await handleLatest(new Request("http://sarf.local/api/v1/rates/latest?currency=USD&kind=official"), store));
    const rates = latest.rates as Array<{ provider: string; lydPerUnit: string }>;
    expect(rates[0]).toMatchObject({ provider: "manual", lydPerUnit: "6.428700" });
  });

  it("skips upstream calls from the cron handler in demo mode", async () => {
    const store = createMemoryStore(october);
    const response = await handleIngest(
      new Request("http://sarf.local/api/cron/ingest"),
      store,
      readConfig({ DEMO_MODE: "true", INGEST_LIVE: "false" }),
      async () => {
        throw new Error("network should not be used");
      },
    );
    expect(response.status).toBe(200);
    const payload = await body(response);
    expect(payload.live).toBe(false);
  });
});
