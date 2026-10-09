"use client";

import { useEffect } from "react";

import { direction, type Locale } from "@/lib/i18n/locale";

export function DocumentLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction(locale);
  }, [locale]);

  return null;
}
