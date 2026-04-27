"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CharityRecord } from "@/lib/types";

type CharityFormState = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  country: string;
  description: string;
  mission: string;
  imageUrl: string;
  spotlight: boolean;
  impactBlurb: string;
  tags: string;
  websiteUrl: string;
};

const emptyState: CharityFormState = {
  slug: "",
  name: "",
  category: "",
  country: "",
  description: "",
  mission: "",
  imageUrl: "",
  spotlight: false,
  impactBlurb: "",
  tags: "",
  websiteUrl: "",
};

export function AdminCharityManager({ charities }: { charities: CharityRecord[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CharityFormState>(emptyState);
  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  async function save() {
    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/admin/charities/${form.id}` : "/api/admin/charities";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to save charity.");
      return;
    }

    toast.success(isEditing ? "Charity updated." : "Charity created.");
    setForm(emptyState);
    router.refresh();
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/charities/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to delete charity.");
      return;
    }

    toast.success("Charity deleted.");
    if (form.id === id) {
      setForm(emptyState);
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit charity" : "Add charity"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            <Input placeholder="Country" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <Textarea placeholder="Mission" value={form.mission} onChange={(event) => setForm((current) => ({ ...current, mission: event.target.value }))} />
          <Input placeholder="Image URL" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
          <Input placeholder="Impact blurb" value={form.impactBlurb} onChange={(event) => setForm((current) => ({ ...current, impactBlurb: event.target.value }))} />
          <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
          <Input placeholder="Website URL" value={form.websiteUrl} onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.spotlight}
              onChange={(event) =>
                setForm((current) => ({ ...current, spotlight: event.target.checked }))
              }
            />
            Featured on homepage
          </label>
          <div className="flex gap-3">
            <Button type="button" onClick={save}>
              {isEditing ? "Save changes" : "Create charity"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={() => setForm(emptyState)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Current charities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {charities.map((charity) => (
            <div key={charity.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">{charity.name}</p>
                  <p className="text-sm text-muted-foreground">{charity.category} · {charity.country}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setForm({
                        id: charity.id,
                        slug: charity.slug,
                        name: charity.name,
                        category: charity.category,
                        country: charity.country,
                        description: charity.description,
                        mission: charity.mission,
                        imageUrl: charity.imageUrl,
                        spotlight: charity.spotlight,
                        impactBlurb: charity.impactBlurb,
                        tags: charity.tags.join(", "),
                        websiteUrl: charity.websiteUrl,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => remove(charity.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
