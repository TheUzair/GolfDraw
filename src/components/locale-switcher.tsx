"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, localeNames } from "@/i18n/config";

const localeFlags: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const changeLocale = async (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value)}
      className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-primary/20"
      aria-label="Select language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeFlags[loc]} {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
