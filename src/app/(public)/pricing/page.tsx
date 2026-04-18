"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/currency";
import type { Locale } from "@/i18n/config";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const locale = useLocale() as Locale;

  const plans = [
    {
      name: t("monthly"),
      price: formatCurrency(9.99, locale),
      interval: t("perMonth"),
      plan: "MONTHLY",
      features: [
        t("features.enterDraws"),
        t("features.trackScores"),
        t("features.supportCharity"),
        t("features.fullDashboard"),
        t("features.winnerVerification"),
        t("features.cancelAnytime"),
      ],
      cta: t("startMonthly"),
      popular: false,
    },
    {
      name: t("yearly"),
      price: formatCurrency(99.99, locale),
      interval: t("perYear"),
      plan: "YEARLY",
      features: [
        t("features.everythingMonthly"),
        t("features.saveOver"),
        t("features.prioritySupport"),
        t("features.annualReport"),
        t("features.earlyNotifications"),
        t("features.exclusiveAccess"),
      ],
      cta: t("startYearly"),
      popular: true,
    },
  ];

  return (
    <div className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 sm:mx-auto sm:max-w-3xl">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border/50"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {t("mostPopular")}
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="h-5 w-5 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/auth/signup?plan=${plan.plan}`} className="mt-8 block">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          All plans include a minimum 10% charity contribution. Secure payments
          via Stripe. Cancel anytime.
        </motion.p>
      </div>
    </div>
  );
}
