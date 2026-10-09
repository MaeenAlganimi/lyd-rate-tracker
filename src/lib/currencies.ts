export const CURRENCIES = [
  { code: "USD", nameEn: "US dollar", nameAr: "دولار أمريكي", symbol: "$", sortOrder: 1 },
  { code: "EUR", nameEn: "Euro", nameAr: "يورو", symbol: "€", sortOrder: 2 },
  { code: "GBP", nameEn: "Pound sterling", nameAr: "جنيه إسترليني", symbol: "£", sortOrder: 3 },
  { code: "TRY", nameEn: "Turkish lira", nameAr: "ليرة تركية", symbol: "₺", sortOrder: 4 },
  { code: "EGP", nameEn: "Egyptian pound", nameAr: "جنيه مصري", symbol: "E£", sortOrder: 5 },
  { code: "TND", nameEn: "Tunisian dinar", nameAr: "دينار تونسي", symbol: "د.ت", sortOrder: 6 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const BY_CODE = new Map(CURRENCIES.map((currency) => [currency.code, currency]));

export function isCurrencyCode(value: string): value is CurrencyCode {
  return BY_CODE.has(value as CurrencyCode);
}

export function currencyByCode(code: string) {
  return BY_CODE.get(code as CurrencyCode) ?? null;
}

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code);
