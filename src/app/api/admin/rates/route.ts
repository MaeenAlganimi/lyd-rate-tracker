import { handleManualRate } from "@/lib/api/handlers";
import { prisma } from "@/lib/store/prisma";
import { prismaStore } from "@/lib/store/prisma";
import { dateFromIso } from "@/lib/dates";

async function storeWithAudit() {
  return {
    ...prismaStore,
    async upsertRates(rows: Parameters<typeof prismaStore.upsertRates>[0]) {
      const count = await prismaStore.upsertRates(rows);
      await prisma.manualAudit.createMany({
        data: rows.map((row) => ({
          currencyCode: row.currencyCode,
          date: dateFromIso(row.date),
          kind: row.kind,
          lydPerUnit: row.lydPerUnit,
          note: row.note,
        })),
      });
      return count;
    },
  };
}

export function POST(request: Request) {
  return storeWithAudit().then((store) => handleManualRate(request, store));
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "POST, OPTIONS",
    },
  });
}
