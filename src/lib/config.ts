export type AppConfig = {
  demoMode: boolean;
  ingestLive: boolean;
  adminToken: string | null;
  cronSecret: string | null;
  cblFeedUrl: string | null;
};

export function readConfig(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): AppConfig {
  const demoMode = env.DEMO_MODE !== "false";
  const configuredAdmin = env.ADMIN_TOKEN?.trim() || null;
  return {
    demoMode,
    ingestLive: env.INGEST_LIVE === "true",
    adminToken: configuredAdmin ?? (demoMode ? "demo-admin" : null),
    cronSecret: env.CRON_SECRET?.trim() || null,
    cblFeedUrl: env.CBL_FEED_URL?.trim() || null,
  };
}
