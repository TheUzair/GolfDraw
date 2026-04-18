"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrophyIcon,
  HeartIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/currency";
import type { Locale } from "@/i18n/config";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-125 w-125 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-125 w-125 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            >
              <SparklesIcon className="h-4 w-4" />
              A new way to play golf
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Play Golf.{" "}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Win Prizes.
              </span>
              <br />
              Give Back.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Track your scores, enter monthly draws, and support charities you
              care about. Every swing counts — for you and your community.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="group gap-2 text-base px-8 py-6">
                  Start Playing
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6"
                >
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              { label: t("statPrizePool"), value: t("statPrizeValue"), sub: t("statPrizeMonthly") },
              { label: t("statCharities"), value: t("statCharitiesValue"), sub: t("statCharitiesGrowing") },
              { label: t("statPlayers"), value: t("statPlayersValue"), sub: t("statPlayersCommunity") },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/50 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Simple. Rewarding. Impactful.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Three simple steps to start making a difference while enjoying the
              game you love.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-8 sm:grid-cols-3"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: ChartBarIcon,
                title: "Track Your Scores",
                desc: "Enter your latest Stableford scores. We keep your last 5 — that's your draw entry.",
                step: "01",
              },
              {
                icon: TrophyIcon,
                title: "Enter Monthly Draws",
                desc: "Your scores become your lottery numbers. Match the draw and win from the prize pool.",
                step: "02",
              },
              {
                icon: HeartIcon,
                title: "Support a Charity",
                desc: "A portion of every subscription goes to the charity of your choice. Play with purpose.",
                step: "03",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp}>
                <Card className="group relative overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-8">
                    <span className="absolute right-4 top-4 text-6xl font-bold text-muted/50">
                      {item.step}
                    </span>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                Real Prizes. Real Impact.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every subscription contributes to the monthly prize pool. The more
                players, the bigger the rewards.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    match: "5-Number Match",
                    share: "40%",
                    note: "Jackpot — rolls over!",
                    color: "bg-primary",
                  },
                  {
                    match: "4-Number Match",
                    share: "35%",
                    note: "Split among winners",
                    color: "bg-accent",
                  },
                  {
                    match: "3-Number Match",
                    share: "25%",
                    note: "Split among winners",
                    color: "bg-chart-3",
                  },
                ].map((tier) => (
                  <div
                    key={tier.match}
                    className="flex items-center gap-4 rounded-xl border border-border/50 p-4"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${tier.color} text-white font-bold text-sm`}
                    >
                      {tier.share}
                    </div>
                    <div>
                      <p className="font-semibold">{tier.match}</p>
                      <p className="text-sm text-muted-foreground">{tier.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl border border-border/50 bg-linear-to-br from-primary/5 to-accent/5 p-8">
                <h3 className="text-center text-lg font-semibold text-muted-foreground">
                  Current Jackpot
                </h3>
                <p className="mt-2 text-center text-5xl font-bold text-primary">
                  {formatCurrency(4250, locale)}
                </p>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Growing with every new subscriber
                </p>
                <div className="mt-8">
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full" size="lg">
                      Join the Next Draw
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Charity Section */}
      <section className="border-t border-border/50 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Every Swing Supports a Cause
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Choose a charity at signup. At least 10% of your subscription goes
              directly to them. You can give more if you choose.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Children's Health",
                "Environmental Action",
                "Community Sports",
                "Mental Health",
              ].map((charity) => (
                <Card
                  key={charity}
                  className="border-border/50 transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <CardContent className="flex items-center gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <HeartIcon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium">{charity}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/charities">
                <Button variant="outline" size="lg" className="gap-2">
                  Explore All Charities
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground sm:p-16"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <h2 className="relative text-3xl font-bold sm:text-4xl">
              Ready to Make Every Round Count?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-primary-foreground/80">
              Join a community of golfers who play with purpose. Subscribe today
              and enter your first draw.
            </p>
            <div className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-base px-8"
                >
                  Get Started Free
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
              {[
                "Cancel anytime",
                "Secure payments",
                "Charity verified",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
