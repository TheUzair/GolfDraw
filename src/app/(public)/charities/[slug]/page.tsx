"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface CharityDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  website: string | null;
  featured: boolean;
  _count: { users: number; donations: number };
}

export default function CharityProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [charity, setCharity] = useState<CharityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/charities/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setCharity)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (notFound || !charity) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <HeartIcon className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="mt-4 text-xl font-semibold">Charity Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The charity you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/charities">
          <Button variant="outline" className="mt-6">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Charities
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/charities">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            All Charities
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 overflow-hidden">
            {charity.image && (
              <div className="h-48 w-full overflow-hidden bg-muted">
                <img
                  src={charity.image}
                  alt={charity.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                    <HeartIcon className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">
                      {charity.name}
                    </h1>
                    {charity.featured && (
                      <span className="mt-1 inline-block rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                        Featured Charity
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-3">
                  <UserGroupIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Supporters</p>
                    <p className="font-semibold">{charity._count.users}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-3">
                  <HeartIcon className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Donations</p>
                    <p className="font-semibold">{charity._count.donations}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground leading-relaxed">
                  {charity.description}
                </p>
              </div>

              {charity.website && (
                <div className="mt-8">
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <GlobeAltIcon className="h-4 w-4" />
                      Visit Website
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
