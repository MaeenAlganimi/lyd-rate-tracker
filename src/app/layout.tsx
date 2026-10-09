import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
});

export const metadata: Metadata = {
  title: {
    default: "Sarf — Libyan dinar rates",
    template: "%s · Sarf",
  },
  description: "Licensed official reference rates for the Libyan dinar, beside a clearly labeled parallel-market sample.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=location.pathname.match(/^\\/(ar|en)(\\/|$)/);var locale=m?m[1]:"en";var html=document.documentElement;html.lang=locale;html.dir=locale==="ar"?"rtl":"ltr";})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
