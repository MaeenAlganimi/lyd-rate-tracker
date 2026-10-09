import { handleHealth } from "@/lib/api/handlers";
import { prisma } from "@/lib/store/prisma";

export function GET(request: Request) {
  return handleHealth(request, async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  });
}
