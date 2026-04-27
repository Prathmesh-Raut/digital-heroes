"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MIN_CHARITY_PERCENT } from "@/lib/constants";
import type {
  CharityRecord,
  ScoreRecord,
  SubscriptionRecord,
  UserRecord,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserDraft = {
  fullName: string;
  email: string;
  country: string;
  role: UserRecord["role"];
  selectedCharityId: string;
  charityContributionPercent: string;
};

type ScoreDraft = {
  value: string;
  playedAt: string;
};

const emptyScoreDraft: ScoreDraft = {
  value: "",
  playedAt: "",
};

function toInputDate(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function sortScoresDescending(scores: ScoreRecord[]) {
  return [...scores].sort(
    (left, right) =>
      new Date(right.playedAt).getTime() - new Date(left.playedAt).getTime(),
  );
}

export function AdminUsersManager({
  users,
  subscriptions,
  charities,
  scores,
}: {
  users: UserRecord[];
  subscriptions: SubscriptionRecord[];
  charities: CharityRecord[];
  scores: ScoreRecord[];
}) {
  const router = useRouter();
  const initialUserId =
    users.find((user) => user.role === "subscriber")?.id ?? users[0]?.id ?? "";
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState<ScoreDraft>(emptyScoreDraft);
  const [userDrafts, setUserDrafts] = useState(
    Object.fromEntries(
      users.map((user) => [
        user.id,
        {
          fullName: user.fullName,
          email: user.email,
          country: user.country,
          role: user.role,
          selectedCharityId: user.selectedCharityId,
          charityContributionPercent: String(user.charityContributionPercent),
        },
      ]),
    ) as Record<string, UserDraft>,
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const selectedSubscription = useMemo(
    () =>
      subscriptions.find((subscription) => subscription.userId === selectedUserId) ??
      null,
    [selectedUserId, subscriptions],
  );

  const selectedScores = useMemo(
    () =>
      sortScoresDescending(
        scores.filter((score) => score.userId === selectedUserId),
      ),
    [scores, selectedUserId],
  );

  function updateDraft<Key extends keyof UserDraft>(
    key: Key,
    value: UserDraft[Key],
  ) {
    if (!selectedUserId) {
      return;
    }

    setUserDrafts((current) => ({
      ...current,
      [selectedUserId]: {
        ...current[selectedUserId],
        [key]: value,
      },
    }));
  }

  function resetScoreForm() {
    setEditingScoreId(null);
    setScoreDraft(emptyScoreDraft);
  }

  function selectUser(userId: string) {
    setSelectedUserId(userId);
    resetScoreForm();
  }

  function beginEditingScore(score: ScoreRecord) {
    setEditingScoreId(score.id);
    setScoreDraft({
      value: String(score.value),
      playedAt: toInputDate(score.playedAt),
    });
  }

  async function saveUser() {
    if (!selectedUserId) {
      return;
    }

    const draft = userDrafts[selectedUserId];
    const response = await fetch(`/api/admin/users/${selectedUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        charityContributionPercent: Number(draft.charityContributionPercent),
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to update user.");
      return;
    }

    toast.success("User profile updated.");
    router.refresh();
  }

  async function saveScore() {
    if (!selectedUserId) {
      return;
    }

    const endpoint = editingScoreId
      ? `/api/admin/users/${selectedUserId}/scores/${editingScoreId}`
      : `/api/admin/users/${selectedUserId}/scores`;
    const method = editingScoreId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: Number(scoreDraft.value),
        playedAt: scoreDraft.playedAt,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to save score.");
      return;
    }

    toast.success(editingScoreId ? "Score updated." : "Score added.");
    resetScoreForm();
    router.refresh();
  }

  async function deleteScore(scoreId: string) {
    if (!selectedUserId) {
      return;
    }

    const response = await fetch(
      `/api/admin/users/${selectedUserId}/scores/${scoreId}`,
      { method: "DELETE" },
    );
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to delete score.");
      return;
    }

    toast.success("Score deleted.");
    if (editingScoreId === scoreId) {
      resetScoreForm();
    }
    router.refresh();
  }

  if (!selectedUser) {
    return (
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No users are available to manage yet.
        </CardContent>
      </Card>
    );
  }

  const activeDraft = userDrafts[selectedUserId];

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>User roster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => {
            const userSubscription = subscriptions.find(
              (subscription) => subscription.userId === user.id,
            );
            const userScoreCount = scores.filter((score) => score.userId === user.id).length;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user.id)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                  user.id === selectedUserId
                    ? "border-primary/60 bg-primary/10"
                    : "border-white/10 bg-black/10 hover:border-primary/30 hover:bg-white/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    {userSubscription?.status ?? "inactive"}
                  </Badge>
                  <Badge variant="secondary">{userScoreCount}/5 scores</Badge>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Profile and charity settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">
                Subscription: {selectedSubscription?.status ?? "inactive"}
              </Badge>
              <Badge variant="outline">
                Plan: {selectedSubscription?.plan ?? "none"}
              </Badge>
              <Badge variant="secondary">
                Joined {new Date(selectedUser.createdAt).toLocaleDateString("en-GB")}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Full name</label>
                <Input
                  value={activeDraft.fullName}
                  onChange={(event) => updateDraft("fullName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={activeDraft.email}
                  onChange={(event) => updateDraft("email", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Country</label>
                <Input
                  value={activeDraft.country}
                  onChange={(event) => updateDraft("country", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Role</label>
                <select
                  value={activeDraft.role}
                  onChange={(event) =>
                    updateDraft("role", event.target.value as UserRecord["role"])
                  }
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="subscriber" className="bg-slate-950">
                    subscriber
                  </option>
                  <option value="admin" className="bg-slate-950">
                    admin
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Selected charity</label>
                <select
                  value={activeDraft.selectedCharityId}
                  onChange={(event) =>
                    updateDraft("selectedCharityId", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id} className="bg-slate-950">
                      {charity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Charity contribution %
                </label>
                <Input
                  type="number"
                  min={MIN_CHARITY_PERCENT}
                  max={90}
                  value={activeDraft.charityContributionPercent}
                  onChange={(event) =>
                    updateDraft("charityContributionPercent", event.target.value)
                  }
                />
              </div>
            </div>

            <Button type="button" onClick={saveUser}>
              Save profile changes
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[320px_1fr]">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>{editingScoreId ? "Edit score" : "Add score"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Admin updates still respect the 1-45 range, duplicate-date rule, and
                rolling five-score retention from the PRD.
              </p>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Stableford score</label>
                <Input
                  type="number"
                  min={1}
                  max={45}
                  value={scoreDraft.value}
                  onChange={(event) =>
                    setScoreDraft((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Round date</label>
                <Input
                  type="date"
                  value={scoreDraft.playedAt}
                  onChange={(event) =>
                    setScoreDraft((current) => ({
                      ...current,
                      playedAt: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={saveScore}>
                  {editingScoreId ? "Update score" : "Add score"}
                </Button>
                {editingScoreId ? (
                  <Button type="button" variant="ghost" onClick={resetScoreForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Latest score history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedScores.map((score) => (
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
                      onClick={() => beginEditingScore(score)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteScore(score.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {!selectedScores.length ? (
                <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                  No scores stored for this user yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
