import { handleCompare } from "@/lib/api/handlers";
import { prismaStore } from "@/lib/store/prisma";

export function GET(request: Request) {
  return handleCompare(request, prismaStore);
}
