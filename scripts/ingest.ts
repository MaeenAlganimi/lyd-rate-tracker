import { readConfig } from "@/lib/config";
import { runIngestion } from "@/lib/ingestion/run";
import { prisma, prismaStore } from "@/lib/store/prisma";

const report = await runIngestion({ store: prismaStore, config: readConfig() });
console.log(JSON.stringify(report, null, 2));
await prisma.$disconnect();
