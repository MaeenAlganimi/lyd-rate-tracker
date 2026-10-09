import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 text-sm leading-6 text-ink-soft md:grid-cols-2">
        <p className="text-ink">{dict.footerCredit}</p>
        <div className="space-y-2">
          <p>{dict.footerOgl}</p>
          <p>{dict.footerTreasury}</p>
          <p>{dict.footerSample}</p>
          <p>
            {dict.footerCbl}{" "}
            <a className="text-sea underline decoration-sea/30 underline-offset-2" href="https://cbl.gov.ly/en/currency-exchange-rates/">
              cbl.gov.ly
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
