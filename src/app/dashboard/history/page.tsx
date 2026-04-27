import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/guards";

export default async function DashboardHistoryPage() {
  const user = await requireUser();
  const snapshot = await appStore.getDashboardSnapshot(user.id);

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Participation history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.draws.map((draw) => {
            const claim = snapshot.winners.find((winner) => winner.drawId === draw.id);
            return (
              <div key={draw.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium">{draw.label}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {draw.mode} draw · {draw.participantUserIds.length} entrants
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
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Badge variant={claim ? "default" : "outline"}>
                    {claim ? `Tier ${claim.matchTier} winner` : "Entered"}
                  </Badge>
                  {claim ? (
                    <p className="text-sm text-emerald-200">
                      Potential reward: {formatCurrency(claim.amount)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matching tier reached in this draw.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
