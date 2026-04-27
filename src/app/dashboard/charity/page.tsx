import Image from "next/image";

import { appStore } from "@/lib/app-store";
import { CharityPreferencesForm } from "@/components/forms/charity-preferences-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";

export default async function DashboardCharityPage() {
  const user = await requireUser();
  const snapshot = await appStore.getDashboardSnapshot(user.id);
  const selectedCharity = snapshot.charities.find(
    (charity) => charity.id === user.selectedCharityId,
  );
  const events = snapshot.charityEvents.filter(
    (event) => event.charityId === user.selectedCharityId,
  );

  return (
    <div className="space-y-6">
      <CharityPreferencesForm
        charities={snapshot.charities}
        currentCharityId={user.selectedCharityId}
        contributionPercent={user.charityContributionPercent}
      />
      {selectedCharity ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card className="border border-white/10 bg-white/5">
            <Image
              src={selectedCharity.imageUrl}
              alt={selectedCharity.name}
              width={1400}
              height={720}
              className="h-72 w-full object-cover"
            />
            <CardContent className="space-y-4 pt-4">
              <div>
                <h2 className="text-2xl font-semibold">{selectedCharity.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedCharity.description}
                </p>
              </div>
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Your current contribution preference is {user.charityContributionPercent}% of each subscription payment.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Upcoming events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.startsAt)} · {event.location}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{event.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
