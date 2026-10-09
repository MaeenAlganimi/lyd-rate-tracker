import { handleSources } from "@/lib/api/handlers";

export function GET() {
  return handleSources();
}
