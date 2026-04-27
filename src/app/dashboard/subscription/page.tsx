import { SubscriptionForm } from "@/components/forms/subscription-form";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";

export default async function DashboardSubscriptionPage() {
  const user = await requireUser();
  const snapshot = await appStore.getDashboardSnapshot(user.id);
  const subscription = snapshot.subscription;
  const recentPayments = snapshot.payments.filter((payment) => payment.kind === "subscription");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Status"
          value={subscription?.status ?? "inactive"}
          caption="Every protected route checks this before allowing score and draw actions."
        />
        <StatCard
          label="Plan"
          value={subscription?.plan ?? "none"}
          caption="Monthly and yearly tiers share the same core feature set."
        />
        <StatCard
          label="Renewal"
          value={subscription ? formatDate(subscription.renewsAt) : "Not set"}
          caption="Renewal and lapsed states stay visible in the member dashboard."
        />
      </div>
      <SubscriptionForm subscription={subscription} />
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="font-medium">{payment.description}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(payment.createdAt).toLocaleDateString()} · ${payment.amount}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
