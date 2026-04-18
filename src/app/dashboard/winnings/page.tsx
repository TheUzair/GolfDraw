"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrophyIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/currency";
import type { Locale } from "@/i18n/config";

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
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("winnings");
  const locale = useLocale() as Locale;

  const fetchWinners = useCallback(async () => {
    const res = await fetch("/api/winners");
    const data = await res.json();
    setWinners(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const submitProof = async (winnerId: string, file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await uploadRes.json();

      // Submit proof URL to winner
      await fetch("/api/winners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, proofUrl: url }),
      });
      setUploadingId(null);
      fetchWinners();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">{t("totalWinnings")}</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalWinnings, locale)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">{t("paidOut")}</p>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(paidWinnings, locale)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Winners List */}
      {winners.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <TrophyIcon className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">{t("noWinnings")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("noWinningsDesc")}
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
                  {formatCurrency(winner.prizeAmount, locale)}
                </p>

                {winner.status === "PENDING" && (
                  <div className="mt-4">
                    {uploadingId === winner.id ? (
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) submitProof(winner.id, file);
                          }}
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-muted/50"
                        >
                          <ArrowUpTrayIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {uploading
                              ? t("uploading")
                              : t("clickToSelect")}
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            {t("allowedFormats")}
                          </p>
                        </div>
                        {uploadError && (
                          <p className="text-xs text-red-500">{uploadError}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadingId(null);
                            setUploadError("");
                          }}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setUploadingId(winner.id)}
                      >
                        <ArrowUpTrayIcon className="mr-1.5 h-4 w-4" />
                        {t("uploadProof")}
                      </Button>
                    )}
                  </div>
                )}

                {winner.proofUrl && (
                  <div className="mt-2">
                    <a
                      href={winner.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {t("viewProof")}
                    </a>
                  </div>
                )}

                {winner.paidAt && (
                  <p className="mt-2 text-xs text-green-500">
                    {t("paidOn")} {new Date(winner.paidAt).toLocaleDateString()}
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
