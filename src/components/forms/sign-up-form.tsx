"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MIN_CHARITY_PERCENT, PLAN_DEFINITIONS } from "@/lib/constants";
import type { CharityRecord } from "@/lib/types";

export function SignUpForm({ charities }: { charities: CharityRecord[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
        charityId: formData.get("charityId"),
        charityContributionPercent: Number(formData.get("charityContributionPercent")),
        plan: selectedPlan,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to create your account.");
      return;
    }

    toast.success("Account created and subscription activated.");
    router.push(payload.redirectUrl ?? "/dashboard");
    router.refresh();
  }

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Create your subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Full name</label>
              <Input name="fullName" placeholder="Maya Chen" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input name="email" type="email" placeholder="maya@digitalheroes.dev" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Password</label>
            <Input name="password" type="password" placeholder="At least 8 characters" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Choose a charity</label>
              <select
                name="charityId"
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                defaultValue={charities[0]?.id}
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
                name="charityContributionPercent"
                type="number"
                min={MIN_CHARITY_PERCENT}
                max={90}
                defaultValue={15}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {PLAN_DEFINITIONS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-black/10 hover:bg-white/5"
                }`}
              >
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="mt-1 text-2xl font-semibold">${plan.amount}</p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.teaser}</p>
              </button>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Join Digital Heroes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
