"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharityRecord } from "@/lib/types";

export function CharityPreferencesForm({
  charities,
  currentCharityId,
  contributionPercent,
}: {
  charities: CharityRecord[];
  currentCharityId: string;
  contributionPercent: number;
}) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/preferences/charity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charityId: formData.get("charityId"),
        charityContributionPercent: Number(formData.get("charityContributionPercent")),
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to update charity preferences.");
      return;
    }

    toast.success("Charity preferences updated.");
    router.refresh();
  }

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Charity selection</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Preferred charity</label>
            <select
              name="charityId"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              defaultValue={currentCharityId}
            >
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id} className="bg-slate-950">
                  {charity.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Contribution %</label>
            <Input
              name="charityContributionPercent"
              type="number"
              min={10}
              max={90}
              defaultValue={contributionPercent}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
