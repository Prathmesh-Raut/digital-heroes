import { AdminRevenueChart } from "@/components/charts/admin-revenue-chart";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";

export default async function AdminOverviewPage() {
  const snapshot = await appStore.getAdminSnapshot();
  const totalPrizePool = snapshot.draws.reduce((sum, draw) => sum + draw.prizePool.total, 0);
  const totalCharity = snapshot.payments.reduce(
    (sum, payment) => sum + (payment.charityAmount ?? 0),
    0,
  );
  const chartData = ["2026-02", "2026-03", "2026-04"].map((month) => {
    const monthlyPayments = snapshot.payments.filter((payment) =>
      payment.createdAt.startsWith(month),
    );
    return {
      month,
      subscriptions: monthlyPayments
        .filter((payment) => payment.kind === "subscription")
        .reduce((sum, payment) => sum + payment.amount, 0),
      charity: monthlyPayments.reduce(
        (sum, payment) => sum + (payment.charityAmount ?? 0),
        0,
      ),
      payouts: monthlyPayments
        .filter((payment) => payment.kind === "payout")
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={`${snapshot.users.length}`} caption="Supports future multi-country and corporate expansion." />
        <StatCard label="Prize pool" value={formatCurrency(totalPrizePool)} caption="Includes rollover logic across published draws." />
        <StatCard label="Charity routed" value={formatCurrency(totalCharity)} caption="Subscription allocations plus independent giving." />
        <StatCard label="Claims" value={`${snapshot.winners.length}`} caption="Winner verification and payout queue across every draw." />
      </div>
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Revenue and distribution trends</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminRevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
