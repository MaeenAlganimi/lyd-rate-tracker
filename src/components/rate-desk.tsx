import Link from "next/link";

import { HistoryChart } from "@/components/history-chart";
import { dashboardHref, type DashboardReady } from "@/lib/dashboard";
import { formatDate, formatPercent, formatRate, formatSigned } from "@/lib/format";
import { invertRate } from "@/lib/rates/decimal";
import { currencyByCode } from "@/lib/currencies";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { presentPoint } from "@/lib/api/present";

export function RateDesk({ locale, data }: { locale: Locale; data: DashboardReady }) {
  const dict = getDictionary(locale);
  const { query, hero, tiles, points, runs } = data;
  const currency = currencyByCode(query.currency);
  const name = currency ? (locale === "ar" ? currency.nameAr : currency.nameEn) : query.currency;
  const rows = points.map(presentPoint);
  const parallelIsSample = query.parallel === "sample" || rows.some((row) => row.parallelSample);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8">
      <section className="grid gap-4 lg:grid-cols-12">
        <article className="panel rounded-3xl p-6 lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">{dict.heroEyebrow}</p>
          <h1 className="mt-3 text-lg text-ink-soft">
            {dict.perUnit} {name}
          </h1>
          <p className="font-display mt-2 text-6xl leading-none tabular-nums tracking-tight text-ink sm:text-7xl">
            {formatRate(hero.official?.lydPerUnit ?? null)}
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            {hero.official ? (
              <>
                {dict.providers[hero.official.provider as keyof typeof dict.providers] ?? hero.official.provider}
                {" · "}
                {dict.asOf} {formatDate(hero.official.date, locale)}
                {" · "}
                {hero.official.isDerived ? dict.derived : dict.direct}
              </>
            ) : (
              dict.missingOfficial
            )}
          </p>
          {hero.official ? (
            <p className="mt-4 text-sm text-ink-soft">
              {dict.perLyd} {formatRate(invertRate(hero.official.lydPerUnit))} {query.currency}
            </p>
          ) : null}
        </article>
        <article className="panel relative overflow-hidden rounded-3xl p-6 lg:col-span-5">
          {parallelIsSample ? <span className="sample-stamp absolute end-5 top-5">{dict.sampleStamp}</span> : null}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">{dict.parallelEyebrow}</p>
          <p className="font-display mt-8 text-5xl tabular-nums tracking-tight text-ink">
            {formatRate(hero.parallel?.lydPerUnit ?? null)}
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            {hero.parallel ? (
              <>
                {dict.providers[hero.parallel.provider as keyof typeof dict.providers] ?? hero.parallel.provider}
                {" · "}
                {formatDate(hero.parallel.date, locale)}
              </>
            ) : (
              dict.missingParallel
            )}
          </p>
          <p className="mt-6 text-sm text-ink-soft">{dict.premium}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-copper-deep">
            {formatSigned(hero.absolute)} <span className="text-base font-medium text-ink-soft">{formatPercent(hero.percent)}</span>
          </p>
        </article>
      </section>

      <div className="flex flex-wrap gap-2">
        {tiles.map((tile) => {
          const meta = currencyByCode(tile.currency);
          const selected = tile.currency === query.currency;
          return (
            <Link
              key={tile.currency}
              href={dashboardHref(locale, query, { currency: tile.currency as DashboardReady["query"]["currency"] })}
              aria-current={selected ? "true" : undefined}
              className={`min-w-28 rounded-2xl border px-3 py-2 ${selected ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink"}`}
            >
              <span className="block text-xs opacity-80">{tile.currency}</span>
              <span className="block text-lg font-semibold tabular-nums">{formatRate(tile.official?.lydPerUnit ?? null)}</span>
              <span className={`block text-xs ${selected ? "text-paper/80" : "text-ink-soft"}`}>
                {meta ? (locale === "ar" ? meta.nameAr : meta.nameEn) : tile.currency}
              </span>
            </Link>
          );
        })}
      </div>

      <section className="panel rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{dict.chartTitle}</h2>
            <p className="mt-1 text-sm text-ink-soft">{dict.chartCaption}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {(["1y", "2y", "all"] as const).map((range) => (
              <Link
                key={range}
                href={dashboardHref(locale, query, { range })}
                className={`rounded-full px-3 py-1 ${query.range === range ? "bg-sea text-white" : "bg-paper-deep text-ink"}`}
              >
                {dict.ranges[range]}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="text-ink-soft">{dict.switches.official}</legend>
            {(["hmrc", "treasury", "manual"] as const).map((official) => (
              <Link
                key={official}
                href={dashboardHref(locale, query, { official })}
                className={query.official === official ? "font-semibold text-sea" : "text-ink-soft"}
              >
                {dict.providers[official]}
              </Link>
            ))}
          </fieldset>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="text-ink-soft">{dict.switches.parallel}</legend>
            {(["sample", "manual"] as const).map((parallel) => (
              <Link
                key={parallel}
                href={dashboardHref(locale, query, { parallel })}
                className={query.parallel === parallel ? "font-semibold text-copper" : "text-ink-soft"}
              >
                {dict.providers[parallel]}
              </Link>
            ))}
          </fieldset>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="inline-flex items-center gap-2 text-sea">
            <span className="inline-block h-0.5 w-6 bg-sea" /> {dict.series.official}
          </span>
          <span className="inline-flex items-center gap-2 text-copper">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-copper" /> {dict.series.parallel}
            {parallelIsSample ? ` · ${dict.sampleStamp}` : ""}
          </span>
        </div>
        <HistoryChart
          locale={locale}
          labels={{ official: dict.series.official, parallel: dict.series.parallel, sample: dict.sampleStamp }}
          points={rows.map((row) => ({
            date: row.date,
            official: row.official === null ? null : Number(row.official),
            parallel: row.parallel === null ? null : Number(row.parallel),
            parallelSample: row.parallelSample,
          }))}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-start text-sm">
            <thead className="text-ink-soft">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">{dict.table.date}</th>
                <th className="py-2 font-medium">{dict.table.official}</th>
                <th className="py-2 font-medium">{dict.table.parallel}</th>
                <th className="py-2 font-medium">{dict.table.gap}</th>
                <th className="py-2 font-medium">{dict.table.premium}</th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row) => (
                <tr key={row.date} className="border-b border-line/70 tabular-nums">
                  <td className="py-2">{formatDate(row.date, locale)}</td>
                  <td className="py-2">{formatRate(row.official)}</td>
                  <td className="py-2">
                    {formatRate(row.parallel)}
                    {row.parallelSample ? <span className="ms-2 text-xs text-sample">{dict.sampleStamp}</span> : null}
                  </td>
                  <td className="py-2">{formatSigned(row.spreadAbsolute)}</td>
                  <td className="py-2">{formatPercent(row.spreadPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {runs.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">{dict.runs}</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {runs.map((run) => (
              <li key={run.id}>
                {run.provider} · {run.status} · {run.rowCount}
                {run.message ? ` · ${run.message}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
