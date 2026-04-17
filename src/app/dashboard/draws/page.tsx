"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface DrawData {
  draws: {
    id: string;
    month: number;
    year: number;
    numbers: number[];
    status: string;
    results: { matchType: string; winnerCount: number; prizeAmount: number }[];
    winners: { id: string; matchType: string; prizeAmount: number }[];
    _count: { entries: number };
  }[];
  currentEntry: { id: string; numbers: number[] } | null;
}

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DrawsPage() {
  const [data, setData] = useState<DrawData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/draws")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Draw Results</h1>
        <p className="text-sm text-muted-foreground">
          View past draws and check if you&apos;ve won.
        </p>
      </div>

      {data?.currentEntry && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-primary">
              ✓ You&apos;re entered in the current month&apos;s draw
            </p>
            <div className="mt-3 flex gap-2">
              {data.currentEntry.numbers.map((n, i) => (
                <span
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
                >
                  {n}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data?.draws && data.draws.length > 0 ? (
        <div className="space-y-4">
          {data.draws.map((draw) => (
            <Card key={draw.id} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">
                  {monthNames[draw.month]} {draw.year}
                </CardTitle>
                <Badge variant={draw.status === "PUBLISHED" ? "default" : "secondary"}>
                  {draw.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {draw.numbers.map((n, i) => (
                    <span
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                {draw.results.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {draw.results.map((result) => (
                      <div
                        key={result.matchType}
                        className="rounded-lg border border-border/50 p-3 text-center"
                      >
                        <p className="text-xs text-muted-foreground">
                          {result.matchType.replace("_", " ")}
                        </p>
                        <p className="text-sm font-semibold">
                          {result.winnerCount} winner{result.winnerCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          £{result.prizeAmount.toFixed(2)} each
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {draw.winners.length > 0 && (
                  <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <TrophyIcon className="h-4 w-4" />
                      You won!
                    </p>
                    {draw.winners.map((w) => (
                      <p key={w.id} className="mt-1 text-sm text-muted-foreground">
                        {w.matchType.replace("_", " ")} — £{w.prizeAmount.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <TrophyIcon className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              No draw results yet. Stay tuned for the next monthly draw!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
