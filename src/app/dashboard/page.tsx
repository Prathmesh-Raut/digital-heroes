import { Bell, CalendarClock, HeartHandshake, Trophy } from "lucide-react";

import { appStore } from "@/lib/app-store";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";
import { LinkButton } from "@/components/link-button";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const snapshot = await appStore.getDashboardSnapshot(user.id);
  const totalWon = snapshot.winners.reduce((sum, winner) => sum + winner.amount, 0);
  const pendingClaims = snapshot.winners.filter(
    (winner) => winner.verificationStatus !== "approved",
  ).length;
  const drawsEntered = snapshot.draws.length;
  const upcomingEvents = snapshot.charityEvents.filter(
    (event) => event.charityId === user.selectedCharityId,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Membership"
          value={snapshot.subscription?.status ?? "inactive"}
          caption="Validated on protected requests and member pages."
        />
        <StatCard
          label="Scores stored"
          value={`${snapshot.scores.length}/5`}
          caption="The oldest round is replaced automatically when a sixth score is added."
        />
        <StatCard
          label="Draws entered"
          value={`${drawsEntered}`}
          caption="Published monthly draws you have already participated in."
        />
        <StatCard
          label="Total won"
          value={formatCurrency(totalWon)}
          caption="Verified prize totals across all published draws."
        />
        <StatCard
          label="Claim queue"
          value={`${pendingClaims}`}
          caption="Proof uploads waiting for review or still not submitted."
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Score trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart scores={snapshot.scores} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Current charity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.charities
                .filter((charity) => charity.id === user.selectedCharityId)
                .map((charity) => (
                  <div key={charity.id} className="space-y-3">
                    <Badge variant="secondary">{charity.category}</Badge>
                    <p className="text-lg font-semibold">{charity.name}</p>
                    <p className="text-sm text-muted-foreground">{charity.impactBlurb}</p>
                    <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                      {user.charityContributionPercent}% of each membership payment is
                      currently routed here.
                    </p>
                    <LinkButton href="/dashboard/charity" variant="ghost" className="px-0">
                      Manage charity
                    </LinkButton>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Upcoming moments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-1 size-4 text-emerald-200" />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.startsAt)} · {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!upcomingEvents.length ? (
                <p className="text-sm text-muted-foreground">No upcoming charity events yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-emerald-200" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="font-medium">{item.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Quick access</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/dashboard/scores", label: "Manage scores", icon: Trophy },
              { href: "/dashboard/charity", label: "Adjust giving", icon: HeartHandshake },
              { href: "/dashboard/winnings", label: "Submit proof", icon: Bell },
            ].map((item) => (
              <LinkButton
                key={item.href}
                href={item.href}
                variant="outline"
                className="h-auto flex-col items-start gap-3 rounded-2xl border-white/10 p-4"
              >
                <item.icon className="size-4" />
                {item.label}
              </LinkButton>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
