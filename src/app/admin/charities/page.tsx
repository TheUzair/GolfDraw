"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string | null;
  logoUrl: string | null;
  active: boolean;
  _count: { users: number; donations: number };
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    logoUrl: "",
  });

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/charities");
    const data = await res.json();
    setCharities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const createCharity = async () => {
    setCreating(true);
    await fetch("/api/admin/charities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setDialogOpen(false);
    setForm({ name: "", description: "", website: "", logoUrl: "" });
    fetchCharities();
  };

  const toggleActive = async (charity: Charity) => {
    await fetch(`/api/admin/charities/${charity.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !charity.active }),
    });
    fetchCharities();
  };

  const deleteCharity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charity?")) return;
    await fetch(`/api/admin/charities/${id}`, { method: "DELETE" });
    fetchCharities();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Charity Management</h1>
          <p className="text-sm text-muted-foreground">
            {charities.length} charities registered
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Charity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Charity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Charity name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Brief description of the charity"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <Button
                className="w-full"
                onClick={createCharity}
                disabled={creating || !form.name || !form.description}
              >
                {creating ? "Creating..." : "Create Charity"}
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
      ) : charities.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No charities yet. Add your first charity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="border-border/50">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{charity.name}</h3>
                    <Badge
                      variant={charity.active ? "default" : "secondary"}
                    >
                      {charity.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {charity.description}
                  </p>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    <span>{charity._count.users} users</span>
                    <span>{charity._count.donations} donations</span>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(charity)}
                  >
                    {charity.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCharity(charity.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
