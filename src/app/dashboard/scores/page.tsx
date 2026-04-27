import { ScoreTrendChart } from "@/components/charts/score-trend-chart";
import { ScoreManager } from "@/components/forms/score-manager";
import { SubscriptionGate } from "@/components/subscription-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { requireUser } from "@/lib/guards";

export default async function DashboardScoresPage() {
  const user = await requireUser();
  const subscription = await appStore.getUserSubscription(user.id);
  const scores = await appStore.getLatestScores(user.id);

  return (
    <div className="space-y-6">
      <SubscriptionGate subscription={subscription}>
        <div className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Score performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart scores={scores} />
            </CardContent>
          </Card>
          <ScoreManager scores={scores} />
        </div>
      </SubscriptionGate>
    </div>
  );
}
