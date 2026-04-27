"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_DEFINITIONS } from "@/lib/constants";
import type { SubscriptionRecord } from "@/lib/types";

export function SubscriptionForm({
  subscription,
}: {
  subscription: SubscriptionRecord | null;
}) {
  const router = useRouter();

  async function activate(plan: "monthly" | "yearly") {
    const response = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to start checkout.");
      return;
    }

    if (typeof payload.sessionUrl === "string" && payload.sessionUrl.startsWith("http")) {
      window.location.assign(payload.sessionUrl);
      return;
    }

    toast.success(`Subscription updated to ${plan}.`);
    router.push(payload.sessionUrl ?? "/dashboard/subscription");
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PLAN_DEFINITIONS.map((plan) => (
        <Card
          key={plan.id}
          className={`border ${
            subscription?.plan === plan.id && subscription.status !== "expired"
              ? "border-primary bg-primary/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-semibold">${plan.amount}</p>
              <p className="text-sm text-muted-foreground">{plan.billingLabel}</p>
            </div>
            <p className="text-sm text-muted-foreground">{plan.teaser}</p>
            <Button onClick={() => activate(plan.id)}>
              {subscription?.plan === plan.id ? "Refresh plan" : `Switch to ${plan.name}`}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
