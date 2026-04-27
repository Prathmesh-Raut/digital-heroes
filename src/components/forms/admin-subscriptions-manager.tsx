"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubscriptionRecord, UserRecord } from "@/lib/types";

export function AdminSubscriptionsManager({
  subscriptions,
  users,
}: {
  subscriptions: SubscriptionRecord[];
  users: UserRecord[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(
    Object.fromEntries(
      subscriptions.map((subscription) => [
        subscription.id,
        { status: subscription.status, plan: subscription.plan },
      ]),
    ) as Record<string, { status: SubscriptionRecord["status"]; plan: SubscriptionRecord["plan"] }>,
  );

  async function save(subscriptionId: string) {
    const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drafts[subscriptionId]),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to update subscription.");
      return;
    }

    toast.success("Subscription updated.");
    router.refresh();
  }

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Subscription management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptions.map((subscription) => {
          const user = users.find((item) => item.id === subscription.userId);
          return (
            <div key={subscription.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 lg:grid-cols-[1.3fr_180px_160px_auto] lg:items-center">
              <div>
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <select
                value={drafts[subscription.id]?.plan}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [subscription.id]: {
                      ...current[subscription.id],
                      plan: event.target.value as "monthly" | "yearly",
                    },
                  }))
                }
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="monthly" className="bg-slate-950">
                  monthly
                </option>
                <option value="yearly" className="bg-slate-950">
                  yearly
                </option>
              </select>
              <select
                value={drafts[subscription.id]?.status}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [subscription.id]: {
                      ...current[subscription.id],
                      status: event.target.value as SubscriptionRecord["status"],
                    },
                  }))
                }
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                {["active", "inactive", "renewal_due", "expired", "cancelled"].map((status) => (
                  <option key={status} value={status} className="bg-slate-950">
                    {status}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={() => save(subscription.id)}>
                Save
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
