"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ScoreRecord } from "@/lib/types";

function toInputDate(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function ScoreManager({
  scores,
  disabled,
}: {
  scores: ScoreRecord[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingScore = useMemo(
    () => scores.find((score) => score.id === editingId) ?? null,
    [editingId, scores],
  );

  async function saveScore(formData: FormData) {
    const payload = {
      value: Number(formData.get("value")),
      playedAt: formData.get("playedAt"),
    };
    const url = editingId ? `/api/scores/${editingId}` : "/api/scores";
    const method = editingId ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Unable to save score.");
      return;
    }

    toast.success(editingId ? "Score updated." : "Score saved.");
    setEditingId(null);
    router.refresh();
  }

  async function deleteScore(scoreId: string) {
    const response = await fetch(`/api/scores/${scoreId}`, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Unable to delete score.");
      return;
    }

    toast.success("Score deleted.");
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>{editingId ? "Edit score" : "Add score"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveScore} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Stableford score</label>
              <Input
                name="value"
                type="number"
                min={1}
                max={45}
                defaultValue={editingScore?.value ?? ""}
                disabled={disabled}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Round date</label>
              <Input
                name="playedAt"
                type="date"
                defaultValue={toInputDate(editingScore?.playedAt)}
                disabled={disabled}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={disabled}>
                {editingId ? "Update score" : "Save score"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Last 5 scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
            >
              <div>
                <p className="text-lg font-semibold">{score.value} pts</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(score.playedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => setEditingId(score.id)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => deleteScore(score.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {!scores.length ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
              No scores yet. Add your first round to unlock the draw logic.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
