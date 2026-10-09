import { Suspense } from "react";
import { notFound } from "next/navigation";

import { RateDesk } from "@/components/rate-desk";
import { loadDashboard } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locale";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<DeskSkeleton />}>
      <Desk params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Desk({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const query = await searchParams;
  const dict = getDictionary(locale);
  const data = await loadDashboard(query);
  if (data.status === "empty") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-semibold">{dict.emptyTitle}</h1>
        <p className="mt-3 text-ink-soft">{dict.emptyBody}</p>
      </section>
    );
  }
  if (data.status === "offline") {
    return (
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-semibold">{dict.offlineTitle}</h1>
        <p className="mt-3 text-ink-soft">{dict.offlineBody}</p>
      </section>
    );
  }
  return <RateDesk locale={locale} data={data} />;
}

function DeskSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8">
      <div className="panel h-56 animate-pulse rounded-3xl bg-paper-deep/40" />
      <div className="panel h-80 animate-pulse rounded-3xl bg-paper-deep/40" />
    </div>
  );
}
