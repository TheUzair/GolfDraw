"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface Winner {
  id: string;
  matchType: string;
  prizeAmount: number;
  proofUrl: string | null;
  status: string;
  paidAt: string | null;
  draw: { month: number; year: number };
}

const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PROOF_SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function WinningsPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchWinners = useCallback(async () => {
    const res = await fetch("/api/winners");
    const data = await res.json();
    setWinners(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const submitProof = async (winnerId: string) => {
    if (!proofUrl.trim()) return;
    await fetch("/api/winners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, proofUrl }),
    });
    setUploadingId(null);
    setProofUrl("");
    fetchWinners();
  };

  const totalWinnings = winners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const paidWinnings = winners
    .filter((w) => w.status === "PAID")
    .reduce((sum, w) => sum + w.prizeAmount, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Winnings</h1>
        <p className="text-sm text-muted-foreground">
          View your prizes and submit verification proofs.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Winnings</p>
            <p className="text-2xl font-bold text-primary">
              £{totalWinnings.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Paid Out</p>
            <p className="text-2xl font-bold text-green-500">
              £{paidWinnings.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Winners List */}
      {winners.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <TrophyIcon className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No winnings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep playing — your lucky draw is coming!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {winners.map((winner) => (
            <Card key={winner.id} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">
                  {monthNames[winner.draw.month]} {winner.draw.year} —{" "}
                  {winner.matchType.replace("_", " ")}
                </CardTitle>
                <Badge className={statusColors[winner.status] || ""}>
                  {winner.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  £{winner.prizeAmount.toFixed(2)}
                </p>

                {winner.status === "PENDING" && (
                  <div className="mt-4">
                    {uploadingId === winner.id ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter proof URL (e.g., screenshot link)"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                        />
                        <Button onClick={() => submitProof(winner.id)}>
                          Submit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setUploadingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setUploadingId(winner.id)}
                      >
                        Upload Proof
                      </Button>
                    )}
                  </div>
                )}

                {winner.proofUrl && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Proof submitted: {winner.proofUrl}
                  </p>
                )}

                {winner.paidAt && (
                  <p className="mt-2 text-xs text-green-500">
                    Paid on {new Date(winner.paidAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
