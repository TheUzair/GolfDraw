"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  featured: boolean;
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/charities?${params}`)
      .then((r) => r.json())
      .then(setCharities)
      .catch(() => setCharities([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold sm:text-5xl">Our Charities</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Every subscription makes a difference. Choose a charity to support
            and track your impact.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
                  <div className="mt-4 h-5 w-32 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : charities.length === 0 ? (
          <div className="mt-16 text-center">
            <HeartIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {search
                ? "No charities found matching your search."
                : "No charities available yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group border-border/50 transition-all hover:border-accent/30 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                        <HeartIcon className="h-6 w-6 text-accent" />
                      </div>
                      {charity.featured && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">
                      {charity.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {charity.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
