"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeartIcon } from "@heroicons/react/24/outline";

interface Charity {
  id: string;
  name: string;
  description: string;
  featured: boolean;
}

interface Profile {
  charityId: string | null;
  charityPct: number;
  charity: Charity | null;
}

export default function CharityDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [charityPct, setCharityPct] = useState("10");
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/charities").then((r) => r.json()),
    ])
      .then(([profileData, charitiesData]) => {
        setProfile(profileData);
        setCharities(charitiesData);
        setSelectedCharity(profileData.charityId || "");
        setCharityPct(String(profileData.charityPct || 10));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const savePreferences = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charityId: selectedCharity || undefined,
        charityPct: parseInt(charityPct),
      }),
    });
    setSaving(false);
  };

  const makeDonation = async () => {
    if (!selectedCharity || !donationAmount) return;
    await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charityId: selectedCharity,
        amount: parseFloat(donationAmount),
      }),
    });
    setDonationAmount("");
  };

  const selectedCharityName = charities.find(
    (c) => c.id === selectedCharity
  )?.name;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Charity</h1>
        <p className="text-sm text-muted-foreground">
          Choose your charity and set your contribution percentage.
        </p>
      </div>

      {profile?.charity && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <HeartIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supporting</p>
              <p className="text-lg font-bold">{profile.charity.name}</p>
              <p className="text-sm text-muted-foreground">
                {profile.charityPct}% of subscription
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Charity Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Charity</Label>

            {/* ---- Combobox replaces native <select> ---- */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  {selectedCharityName ?? "Choose a charity..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search charities..." />
                  <CommandList>
                    <CommandEmpty>No charity found.</CommandEmpty>
                    <CommandGroup>
                      {charities.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            setSelectedCharity(c.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCharity === c.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {c.name}
                          {c.featured && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              Featured
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* ------------------------------------------ */}
          </div>

          <div className="space-y-2">
            <Label>Contribution Percentage (min 10%)</Label>
            <Input
              type="number"
              min={10}
              max={100}
              value={charityPct}
              onChange={(e) => setCharityPct(e.target.value)}
            />
          </div>

          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Make an independent donation to your selected charity.
          </p>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Amount (£)"
              min={1}
              step={0.01}
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />
            <Button
              onClick={makeDonation}
              disabled={!selectedCharity || !donationAmount}
            >
              Donate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}