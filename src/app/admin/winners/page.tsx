"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Winner {
  id: string;
  prizeAmount: number;
  matchType: string;
  status: string;
  proofUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  draw: { month: number; year: number; drawType: string };
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    const res = await fetch(`/api/admin/winners?${params}`);
    const data = await res.json();
    setWinners(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const verifyWinner = async (winnerId: string, action: "approve" | "reject") => {
    await fetch("/api/admin/winners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, action }),
    });
    fetchWinners();
  };

  const markPaid = async (winnerId: string) => {
    await fetch("/api/admin/winners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId }),
    });
    fetchWinners();
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    VERIFIED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PAID: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  const matchLabels: Record<string, string> = {
    FOUR_NUMBER: "4-Number Match",
    FIVE_NUMBER: "5-Number Match",
    FULL_MATCH: "Full Match (Jackpot)",
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const filters = ["ALL", "PENDING", "VERIFIED", "APPROVED", "PAID", "REJECTED"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Winner Management</h1>
        <p className="text-sm text-muted-foreground">
          Verify winners and manage payouts.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : winners.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No winners found for this filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {winners.map((winner) => (
            <Card key={winner.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {winner.user.name || winner.user.email}
                      </h3>
                      <Badge className={statusColors[winner.status] || ""}>
                        {winner.status}
                      </Badge>
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <p>{winner.user.email}</p>
                      <p>
                        {months[winner.draw.month - 1]} {winner.draw.year} &bull;{" "}
                        {winner.draw.drawType} &bull;{" "}
                        {matchLabels[winner.matchType] || winner.matchType}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        £{winner.prizeAmount.toFixed(2)}
                      </p>
                    </div>
                    {winner.proofUrl && (
                      <a
                        href={winner.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-primary hover:underline"
                      >
                        View Proof
                      </a>
                    )}
                    {winner.paidAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Paid: {new Date(winner.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(winner.status === "PENDING" ||
                      winner.status === "VERIFIED") && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => verifyWinner(winner.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => verifyWinner(winner.id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    {winner.status === "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markPaid(winner.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
