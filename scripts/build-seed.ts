import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parseHmrcXml } from "@/lib/providers/hmrc";
import { parseTreasuryPayload } from "@/lib/providers/treasury";
import type { RateDraft } from "@/lib/store/types";

type SeedFile = {
  provider: string;
  retrievedAt: string;
  licence: string;
  sourceUrl: string;
  rows: RateDraft[];
};

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const hmrcDir = arg("--hmrc-dir") ?? "/tmp/hmrc-xml";
const treasuryFile = arg("--treasury-file") ?? "/tmp/treasury-raw.json";
const outDir = path.join(process.cwd(), "data/seed");
mkdirSync(outDir, { recursive: true });

const hmrcRows = readdirSync(hmrcDir)
  .filter((name) => name.endsWith(".xml"))
  .sort()
  .flatMap((name) => parseHmrcXml(readFileSync(path.join(hmrcDir, name), "utf8")));

const hmrcSeed: SeedFile = {
  provider: "hmrc",
  retrievedAt: "2026-10-09",
  licence: "Open Government Licence v3.0",
  sourceUrl: "https://www.trade-tariff.service.gov.uk/api/v2/exchange_rates/files/monthly_xml_{period}.xml",
  rows: hmrcRows,
};

const treasurySeed: SeedFile = {
  provider: "treasury",
  retrievedAt: "2026-10-09",
  licence: "U.S. Treasury Fiscal Data — free, without restriction",
  sourceUrl: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
  rows: parseTreasuryPayload(JSON.parse(readFileSync(treasuryFile, "utf8"))),
};

writeFileSync(path.join(outDir, "hmrc.json"), JSON.stringify(hmrcSeed, null, 2));
writeFileSync(path.join(outDir, "treasury.json"), JSON.stringify(treasurySeed, null, 2));
console.log(`Wrote ${hmrcRows.length} HMRC rows and ${treasurySeed.rows.length} Treasury rows.`);
