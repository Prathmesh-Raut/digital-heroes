"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DrawRecord } from "@/lib/types";

type PreviewPayload = {
  draw: DrawRecord;
  tierWinners: Record<3 | 4 | 5, string[]>;
};

function currentMonthKey() {
  const date = new Date();
  return date.toISOString().slice(0, 7);
}

export function DrawControlPanel({ draws }: { draws: DrawRecord[] }) {
  const router = useRouter();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [mode, setMode] = useState<"random" | "weighted">("weighted");
  const [preview, setPreview] = useState<PreviewPayload | null>(null);

  async function run(endpoint: "/api/draws/simulate" | "/api/draws/publish") {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthKey, mode }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to run draw.");
      return;
    }

    if (endpoint === "/api/draws/simulate") {
      setPreview(payload);
      toast.success("Simulation complete.");
    } else {
      toast.success("Draw published.");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Run monthly draw</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Month key</label>
            <input
              value={monthKey}
              onChange={(event) => setMonthKey(event.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Draw mode</label>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as "random" | "weighted")}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="random" className="bg-slate-950">
                Random
              </option>
              <option value="weighted" className="bg-slate-950">
                Weighted
              </option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="button" onClick={() => run("/api/draws/simulate")}>
              Simulate
            </Button>
            <Button type="button" variant="secondary" onClick={() => run("/api/draws/publish")}>
              Publish
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Latest draw insight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview ? (
            <>
              <div className="flex flex-wrap gap-3">
                {preview.draw.numbers.map((number) => (
                  <div
                    key={number}
                    className="flex size-12 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-lg font-semibold text-emerald-100"
                  >
                    {number}
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[3, 4, 5].map((tier) => (
                  <div key={tier} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm text-muted-foreground">Tier {tier}</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {preview.tierWinners[tier as 3 | 4 | 5].length}
                    </p>
                    <p className="text-xs text-muted-foreground">simulated winners</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run a simulation to preview the draw numbers, prize pool, and winner tiers before publishing.
            </p>
          )}
          <div className="space-y-3">
            {draws.slice(0, 4).map((draw) => (
              <div key={draw.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{draw.label}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {draw.mode} · {draw.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {draw.numbers.map((number) => (
                      <span
                        key={number}
                        className="flex size-8 items-center justify-center rounded-full bg-white/10 text-sm"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
