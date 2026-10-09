import { handleCurrencies } from "@/lib/api/handlers";

export function GET() {
  return handleCurrencies();
}
