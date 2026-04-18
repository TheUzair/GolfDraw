"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">G</span>
              </div>
              <span className="text-lg font-bold">
                Golf<span className="text-primary">Draw</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("platform")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {nav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {nav("pricing")}
                </Link>
              </li>
              <li>
                <Link href="/charities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {nav("charities")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("account")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {nav("signIn")}
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("createAccount")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {nav("dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("legal")}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">{t("privacyPolicy")}</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">{t("termsOfService")}</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">{t("cookiePolicy")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
