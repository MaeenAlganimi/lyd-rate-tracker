import { readFileSync } from "node:fs";
import path from "node:path";

import { CURRENCIES } from "@/lib/currencies";
import { buildSampleRates } from "@/lib/rates/sample";
import { prisma } from "@/lib/store/prisma";
import { prismaStore } from "@/lib/store/prisma";
import type { RateDraft } from "@/lib/store/types";

type SeedFile = { rows: RateDraft[] };

function readSeed(name: string): SeedFile {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data/seed", name), "utf8")) as SeedFile;
}

async function main() {
  for (const currency of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      create: currency,
      update: currency,
    });
  }

  const hmrc = readSeed("hmrc.json").rows;
  const treasury = readSeed("treasury.json").rows;
  const sample = buildSampleRates(hmrc);
  const written = await prismaStore.upsertRates([...hmrc, ...treasury, ...sample]);
  await prismaStore.recordRun({
    provider: "seed",
    status: "ok",
    rowCount: written,
    message: "Loaded committed HMRC and Treasury observations and regenerated the SAMPLE parallel series.",
  });
  console.log(`Seeded ${written} rates (${sample.length} of them sample parallel).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
