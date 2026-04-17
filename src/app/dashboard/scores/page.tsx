"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Score {
  id: string;
  value: number;
  playedAt: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = useCallback(async () => {
    const res = await fetch("/api/scores");
    const data = await res.json();
    setScores(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const numValue = parseInt(value);
    if (numValue < 1 || numValue > 45) {
      setError("Score must be between 1 and 45");
      setSubmitting(false);
      return;
    }

    try {
      const url = editingId ? `/api/scores/${editingId}` : "/api/scores";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: numValue, playedAt }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save score");
        setSubmitting(false);
        return;
      }

      resetForm();
      fetchScores();
    } catch {
      setError("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleEdit = (score: Score) => {
    setEditingId(score.id);
    setValue(String(score.value));
    setPlayedAt(new Date(score.playedAt).toISOString().split("T")[0]);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return;
    await fetch(`/api/scores/${id}`, { method: "DELETE" });
    fetchScores();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setValue("");
    setPlayedAt("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Scores</h1>
          <p className="text-sm text-muted-foreground">
            Track your latest Stableford scores ({scores.length}/5)
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Score
          </Button>
        )}
      </div>

      {/* Score Entry Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">
                {editingId ? "Edit Score" : "New Score Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="value">Score (1-45)</Label>
                    <Input
                      id="value"
                      type="number"
                      min={1}
                      max={45}
                      placeholder="e.g., 36"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playedAt">Date Played</Label>
                    <Input
                      id="playedAt"
                      type="date"
                      value={playedAt}
                      onChange={(e) => setPlayedAt(e.target.value)}
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Score"
                        : "Add Score"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Score info */}
      {scores.length >= 5 && !showForm && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
          You have 5 scores. Adding a new score will automatically replace the
          oldest entry.
        </div>
      )}

      {/* Scores List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : scores.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <PlusIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No scores yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first Stableford score to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scores.map((score, i) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50 transition-all hover:border-primary/20">
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {score.value}
                    </div>
                    <div>
                      <p className="font-medium">
                        Stableford Score: {score.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(score.playedAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(score)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(score.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Draw numbers preview */}
      {scores.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Your Draw Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              These scores are your entries for the next monthly draw.
            </p>
            <div className="flex flex-wrap gap-3">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {score.value}
                </div>
              ))}
              {[...Array(Math.max(0, 5 - scores.length))].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground"
                >
                  ?
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
