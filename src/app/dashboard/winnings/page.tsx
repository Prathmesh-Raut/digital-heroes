import { WinnerProofForm } from "@/components/forms/winner-proof-form";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/guards";

export default async function DashboardWinningsPage() {
  const user = await requireUser();
  const snapshot = await appStore.getDashboardSnapshot(user.id);
  const totalWon = snapshot.winners.reduce((sum, winner) => sum + winner.amount, 0);
  const pendingPayouts = snapshot.winners.filter(
    (winner) => winner.payoutStatus === "pending",
  );
  const proofQueue = snapshot.winners.filter(
    (winner) => winner.verificationStatus !== "approved",
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total won" value={formatCurrency(totalWon)} caption="Across all published draws." />
        <StatCard label="Pending payout" value={`${pendingPayouts.length}`} caption="Claims still awaiting final release." />
        <StatCard label="Proof needed" value={`${proofQueue.length}`} caption="Claims that still need proof upload or approval." />
      </div>
      <WinnerProofForm claims={proofQueue} />
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>All winnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.winners.map((claim) => (
            <div key={claim.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">Tier {claim.matchTier}</p>
                  <p className="text-sm text-muted-foreground">
                    Verification: {claim.verificationStatus.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={claim.payoutStatus === "paid" ? "default" : "outline"}>
                    {claim.payoutStatus}
                  </Badge>
                  <p className="text-lg font-semibold">{formatCurrency(claim.amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
