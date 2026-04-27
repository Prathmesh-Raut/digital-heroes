import { notFound } from "next/navigation";
import Image from "next/image";

import { DonationForm } from "@/components/forms/donation-form";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appStore } from "@/lib/app-store";
import { formatDate } from "@/lib/format";

export default async function CharityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const charity = await appStore.getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  const events = await appStore.getCharityEvents(charity.id);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Image
            src={charity.imageUrl}
            alt={charity.name}
            width={1400}
            height={900}
            className="h-[420px] w-full rounded-3xl object-cover"
          />
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{charity.category}</Badge>
              {charity.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{charity.name}</h1>
            <p className="text-sm text-muted-foreground">{charity.description}</p>
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {charity.impactBlurb}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{charity.mission}</p>
              <DonationForm charityId={charity.id} />
              <div className="flex gap-3">
                <LinkButton href="/sign-up">Choose during signup</LinkButton>
                <LinkButton href={charity.websiteUrl} variant="ghost">
                  Visit site
                </LinkButton>
              </div>
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
      </div>
    </main>
  );
}
