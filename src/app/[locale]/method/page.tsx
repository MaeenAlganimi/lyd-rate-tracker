import { notFound } from "next/navigation";

import { SAMPLE_PREMIUMS } from "@/lib/rates/sample";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locale";

export default async function MethodPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <article className="mx-auto grid max-w-3xl gap-8 px-5 py-10">
      <header>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{dict.methodTitle}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">{dict.methodLede}</p>
      </header>
      {dict.method.map((section) => (
        <section key={section.title} className="grid gap-3">
          <h2 className="text-2xl font-semibold">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="leading-8 text-ink">
              {paragraph}
            </p>
          ))}
          {section.title === dict.method[4].title ? (
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SAMPLE_PREMIUMS.map((premium, index) => (
                <li key={dict.months[index]} className="panel rounded-xl px-3 py-2 text-sm">
                  <span className="block text-ink-soft">{dict.months[index]}</span>
                  <span className="tabular-nums font-semibold">{(Number(premium) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ))}
    </article>
  );
}
