import { openApiSpec } from "@/lib/api/openapi";

export function GET() {
  return Response.json(openApiSpec);
}
