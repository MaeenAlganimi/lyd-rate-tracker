import { handleIngest } from "@/lib/api/handlers";
import { prismaStore } from "@/lib/store/prisma";

export function GET(request: Request) {
  return handleIngest(request, prismaStore);
}

export function POST(request: Request) {
  return handleIngest(request, prismaStore);
}
