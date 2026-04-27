import { DrawControlPanel } from "@/components/forms/draw-control-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";

export default async function AdminDrawsPage() {
  const snapshot = await appStore.getAdminSnapshot();

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Draw logic notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Random mode uses lottery-style unique selection between 1 and 45.</p>
          <p>Weighted mode blends high-frequency score values with a controlled long-tail boost so the distribution does not become too predictable.</p>
          <p>Tier-five jackpot automatically rolls into the next published draw if there are no verified 5-match winners.</p>
        </CardContent>
      </Card>
      <DrawControlPanel draws={snapshot.draws} />
    </div>
  );
}
