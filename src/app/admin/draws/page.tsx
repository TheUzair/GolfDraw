"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Draw {
  id: string;
  month: number;
  year: number;
  drawType: string;
  status: string;
  prizePool: number;
  drawDate: string | null;
  _count: { entries: number; results: number };
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [drawType, setDrawType] = useState("MONTHLY");
  const [prizePool, setPrizePool] = useState("500");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDraws = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/draws");
    const data = await res.json();
    setDraws(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  const createDraw = async () => {
    setCreating(true);
    await fetch("/api/admin/draws", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        drawType,
        prizePool: parseFloat(prizePool),
      }),
    });
    setCreating(false);
    setDialogOpen(false);
    fetchDraws();
  };

  const performAction = async (drawId: string, action: string) => {
    setActionLoading(`${drawId}-${action}`);
    await fetch("/api/admin/draws", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, action }),
    });
    setActionLoading(null);
    fetchDraws();
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    SIMULATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    EXECUTED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    PUBLISHED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draw Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure, simulate, and execute draws.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Draw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Draw</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Draw Type</Label>
                <select
                  value={drawType}
                  onChange={(e) => setDrawType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prize Pool (£)</Label>
                <Input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={createDraw} disabled={creating}>
                {creating ? "Creating..." : "Create Draw"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : draws.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No draws yet. Create your first draw.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {draws.map((draw) => (
            <Card key={draw.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {months[draw.month - 1]} {draw.year}
                      </h3>
                      <Badge className={statusColors[draw.status] || ""}>
                        {draw.status}
                      </Badge>
                      <Badge variant="outline">{draw.drawType}</Badge>
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span>Prize: £{draw.prizePool.toFixed(2)}</span>
                      <span>Entries: {draw._count.entries}</span>
                      <span>Results: {draw._count.results}</span>
                      {draw.drawDate && (
                        <span>
                          Draw Date: {new Date(draw.drawDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {draw.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => performAction(draw.id, "simulate")}
                        disabled={actionLoading === `${draw.id}-simulate`}
                      >
                        {actionLoading === `${draw.id}-simulate` ? "..." : "Simulate"}
                      </Button>
                    )}
                    {(draw.status === "PENDING" || draw.status === "SIMULATED") && (
                      <Button
                        size="sm"
                        onClick={() => performAction(draw.id, "execute")}
                        disabled={actionLoading === `${draw.id}-execute`}
                      >
                        {actionLoading === `${draw.id}-execute` ? "..." : "Execute"}
                      </Button>
                    )}
                    {draw.status === "EXECUTED" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => performAction(draw.id, "publish")}
                        disabled={actionLoading === `${draw.id}-publish`}
                      >
                        {actionLoading === `${draw.id}-publish` ? "..." : "Publish"}
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
