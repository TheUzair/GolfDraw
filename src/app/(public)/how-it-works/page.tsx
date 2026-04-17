"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  PencilSquareIcon,
  TrophyIcon,
  HeartIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    icon: PencilSquareIcon,
    title: "1. Sign Up & Subscribe",
    description:
      "Create your account and choose a monthly or yearly plan. Pick a charity to support during signup.",
  },
  {
    icon: CalendarDaysIcon,
    title: "2. Enter Your Scores",
    description:
      "Add your last 5 golf scores in Stableford format (1-45). Only the most recent 5 are kept.",
  },
  {
    icon: TrophyIcon,
    title: "3. Monthly Draw",
    description:
      "Your 5 latest scores become your draw entry numbers. Each month, 5 numbers are drawn.",
  },
  {
    icon: CurrencyDollarIcon,
    title: "4. Win Prizes",
    description:
      "Match 3, 4, or all 5 numbers to win from the prize pool. 5-match jackpot rolls over if unclaimed!",
  },
  {
    icon: ShieldCheckIcon,
    title: "5. Verify & Collect",
    description:
      "Winners upload proof of their scores. Once verified by admin, prizes are paid out.",
  },
  {
    icon: HeartIcon,
    title: "6. Charity Impact",
    description:
      "At least 10% of every subscription goes to your chosen charity. Track your impact on your dashboard.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold sm:text-5xl">How It Works</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            From signup to winnings — here&apos;s everything you need to know about
            playing, winning, and giving back.
          </p>
        </motion.div>

        <div className="mt-16 space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 transition-all hover:border-primary/20 hover:shadow-md">
                <CardContent className="flex items-start gap-6 p-6 sm:p-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Draw Mechanics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-center text-2xl font-bold">Draw Mechanics</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                match: "5-Number Match",
                pool: "40%",
                desc: "Jackpot rolls over if no winner",
                color: "text-primary",
              },
              {
                match: "4-Number Match",
                pool: "35%",
                desc: "Split equally among winners",
                color: "text-accent",
              },
              {
                match: "3-Number Match",
                pool: "25%",
                desc: "Split equally among winners",
                color: "text-chart-3",
              },
            ].map((tier) => (
              <Card key={tier.match} className="border-border/50 text-center">
                <CardContent className="p-6">
                  <p className={`text-3xl font-bold ${tier.color}`}>{tier.pool}</p>
                  <p className="mt-2 font-semibold">{tier.match}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
