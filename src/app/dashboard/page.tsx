"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChartBarIcon,
  TrophyIcon,
  HeartIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

interface DashboardData {
  subscription: { status: string; plan: string; currentPeriodEnd: string } | null;
  scores: { id: string; value: number; playedAt: string }[];
  charity: { name: string } | null;
  charityPct: number;
  winners: { prizeAmount: number; status: string }[];
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const checkoutTriggered = useRef(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const totalWinnings = data?.winners?.reduce((sum, w) => sum + w.prizeAmount, 0) || 0;
  const isSubscribed = data?.subscription?.status === "ACTIVE";

  const handleSubscribe = async (plan: "MONTHLY" | "YEARLY") => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  // Auto-trigger Stripe checkout if coming from pricing → signup flow
  useEffect(() => {
    const plan = searchParams.get("plan") as "MONTHLY" | "YEARLY" | null;
    if (!plan || !data || loading || checkoutTriggered.current) return;
    if (data.subscription?.status === "ACTIVE") return; // already subscribed

    checkoutTriggered.current = true;
    handleSubscribe(plan);
  }, [data, loading, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, {session?.user?.name || "Player"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your golf performance and draw overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <CreditCardIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subscription</p>
                <p className={`text-lg font-bold ${isSubscribed ? "text-green-500" : "text-muted-foreground"}`}>
                  {isSubscribed ? "Active" : "Inactive"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <ChartBarIcon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scores</p>
                <p className="text-lg font-bold">{data?.scores?.length || 0}/5</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-3/10">
                <TrophyIcon className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Winnings</p>
                <p className="text-lg font-bold">£{totalWinnings.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10">
                <HeartIcon className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Charity</p>
                <p className="text-lg font-bold truncate">
                  {data?.charity?.name || "None selected"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription CTA if not subscribed */}
      {!isSubscribed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-lg font-bold">Subscribe to Start Playing</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get access to monthly draws, score tracking, and support charities.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => handleSubscribe("MONTHLY")} variant="outline">
                  £9.99/mo
                </Button>
                <Button onClick={() => handleSubscribe("YEARLY")}>
                  £99.99/yr
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Scores */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Scores</CardTitle>
            <Link href="/dashboard/scores">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.scores && data.scores.length > 0 ? (
              <div className="space-y-3">
                {data.scores.slice(0, 5).map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(score.playedAt).toLocaleDateString()}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {score.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No scores yet. Start tracking your rounds!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Draw Status */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Draw Status</CardTitle>
            <Link href="/dashboard/draws">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrophyIcon className="h-12 w-12 text-primary/30" />
              <p className="mt-4 text-sm text-muted-foreground">
                {isSubscribed
                  ? "You're entered in the next monthly draw!"
                  : "Subscribe to enter the monthly draw."}
              </p>
              {!isSubscribed && (
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => handleSubscribe("MONTHLY")}
                >
                  Subscribe Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
