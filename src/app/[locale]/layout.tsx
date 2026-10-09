import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { DocumentLocale } from "@/components/document-locale";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { direction, isLocale } from "@/lib/i18n/locale";

export const instant = false;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.metaTitle, description: dict.metaDescription };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div lang={locale} dir={direction(locale)} className="flex min-h-screen flex-col">
      <DocumentLocale locale={locale} />
      <Suspense fallback={<div className="h-24 border-b border-line" />}>
        <SiteHeader locale={locale} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
