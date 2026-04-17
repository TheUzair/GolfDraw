"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  CreditCardIcon,
  TrophyIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

interface Analytics {
  totalUsers: number;
  totalSubscribers: number;
  activeSubscriptions: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  totalDraws: number;
  totalWinners: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    role: string;
  }[];
}

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: data?.totalUsers || 0,
      icon: UsersIcon,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Active Subscriptions",
      value: data?.activeSubscriptions || 0,
      icon: CreditCardIcon,
      color: "text-green-500 bg-green-500/10",
    },
    {
      label: "Total Prize Pool",
      value: `£${(data?.totalPrizePool || 0).toFixed(2)}`,
      icon: TrophyIcon,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Charity Contributions",
      value: `£${(data?.totalCharityContributions || 0).toFixed(2)}`,
      icon: HeartIcon,
      color: "text-pink-500 bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and analytics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm text-muted-foreground">Total Subscribers</span>
                <span className="font-semibold">{data?.totalSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm text-muted-foreground">Total Draws</span>
                <span className="font-semibold">{data?.totalDraws || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <span className="text-sm text-muted-foreground">Total Winners</span>
                <span className="font-semibold">{data?.totalWinners || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentUsers && data.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No users yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
