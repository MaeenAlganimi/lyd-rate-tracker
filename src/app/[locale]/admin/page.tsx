import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminForm } from "@/components/admin-form";
import { readConfig } from "@/lib/config";
import { formatDate, formatRate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { prismaStore } from "@/lib/store/prisma";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const demoMode = readConfig().demoMode;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{dict.adminTitle}</h1>
        <p className="mt-4 leading-8 text-ink-soft">{dict.adminLede}</p>
      </header>
      <AdminForm dict={dict} locale={locale} demoMode={demoMode} />
      <Suspense fallback={<p className="text-sm text-ink-soft">…</p>}>
        <RecentManual locale={locale} />
      </Suspense>
    </div>
  );
}

async function RecentManual({ locale }: { locale: Locale }) {
  await connection();
  const dict = getDictionary(locale);
  let rows: Awaited<ReturnType<typeof prismaStore.findRates>> = [];
  try {
    rows = await prismaStore.findRates({ provider: "manual" });
  } catch {
    rows = [];
  }
  const recent = [...rows].reverse().slice(0, 8);
  return (
    <section>
      <h2 className="text-lg font-semibold">{dict.adminRecent}</h2>
      {recent.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{dict.adminNone}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {recent.map((row) => (
            <li key={`${row.date}-${row.currencyCode}-${row.kind}`} className="flex flex-wrap justify-between gap-2 py-2 tabular-nums">
              <span>
                {formatDate(row.date, locale)} · {row.currencyCode} · {row.kind}
              </span>
              <span>{formatRate(row.lydPerUnit)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
