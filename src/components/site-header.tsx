"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { direction, otherLocale, type Locale } from "@/lib/i18n/locale";

const LINKS = [
  { key: "rates", href: "" },
  { key: "method", href: "/method" },
  { key: "api", href: "/docs" },
  { key: "admin", href: "/admin" },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const rest = pathname.replace(/^\/(en|ar)/, "") || "";
  const nextLocale = otherLocale(locale);
  const switchHref = `/${nextLocale}${rest}${search ? `?${search}` : ""}`;

  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-4 px-5 py-5">
        <Link href={`/${locale}`} className="group">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-copper">{dict.kicker}</p>
          <span className="mt-1 flex items-baseline gap-3">
            {locale === "ar" ? (
              <>
                <span className="font-arabic text-5xl leading-none text-ink">صرف</span>
                <span className="font-display text-2xl text-sea">Sarf</span>
              </>
            ) : (
              <>
                <span className="font-display text-5xl leading-none tracking-tight text-ink">Sarf</span>
                <span className="font-arabic text-3xl text-sea">صرف</span>
              </>
            )}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-1">
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label={dict.nav.rates}>
            {LINKS.map((link) => {
              const href = `/${locale}${link.href}`;
              const active = rest === link.href;
              return (
                <Link
                  key={link.key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"}
                >
                  {dict.nav[link.key]}
                </Link>
              );
            })}
          </nav>
          <Link
            href={switchHref}
            hrefLang={nextLocale}
            lang={nextLocale}
            dir={direction(nextLocale)}
            className="rounded-full border border-line bg-card px-3 py-1 text-sm font-semibold text-sea-deep"
            aria-label={dict.languageLabel}
          >
            {nextLocale === "ar" ? "العربية" : "English"}
          </Link>
        </div>
      </div>
    </header>
  );
}
