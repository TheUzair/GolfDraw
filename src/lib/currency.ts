import { localeCurrencies, type Locale } from "@/i18n/config";

const currencyLocales: Record<string, string> = {
  GBP: "en-GB",
  EUR: "de-DE",
  USD: "en-US",
};

export function formatCurrency(
  amount: number,
  locale: Locale = "en"
): string {
  const currency = localeCurrencies[locale] || "GBP";
  const numberLocale = currencyLocales[currency] || "en-GB";
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(locale: Locale = "en"): string {
  const currency = localeCurrencies[locale] || "GBP";
  const formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);
  return formatted.replace(/\d/g, "").trim();
}
