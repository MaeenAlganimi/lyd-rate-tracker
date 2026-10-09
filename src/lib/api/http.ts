import { ZodError } from "zod";

const PUBLIC_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300",
};

export function json(body: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: { ...PUBLIC_HEADERS, ...extraHeaders } });
}

export function fail(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status, { "cache-control": "no-store" });
}

export function invalid(error: unknown): Response {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join(" ");
    return fail(400, "invalid_query", message || "The query is not valid.");
  }
  const message = error instanceof Error ? error.message : "The request could not be read.";
  return fail(400, "invalid_query", message);
}
