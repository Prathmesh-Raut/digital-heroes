import { ArrowRight, HeartHandshake, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";

import { appStore } from "@/lib/app-store";
import { LinkButton } from "@/components/link-button";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function Home() {
  const featuredCharities = await appStore.getFeaturedCharities();
  const monthlyRevenue = await appStore.getMonthlyRecurringRevenue();
  const adminSnapshot = await appStore.getAdminSnapshot();
  const charityTotal = adminSnapshot.payments.reduce(
    (sum, payment) => sum + (payment.charityAmount ?? 0),
    0,
  );

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1800&q=80"
            alt="Golf players celebrating together"
            fill
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.3),rgba(3,7,18,0.9)_55%,rgba(3,7,18,1))]" />
        </div>
        <div className="relative mx-auto flex min-h-[88svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <Badge variant="secondary" className="bg-white/10 text-white">
              Emotional golf SaaS with charity-first design
            </Badge>
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Digital Heroes
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/80">
              Log your last five Stableford rounds, power a monthly prize draw,
              and send a meaningful slice of every membership straight to a
              charity you believe in.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/sign-up" size="lg" className="bg-white text-slate-950 hover:bg-white/85">
                Subscribe now
              </LinkButton>
              <LinkButton href="/charities" size="lg" variant="outline" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
                Explore charities
              </LinkButton>
            </div>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Monthly pool"
              value={formatCurrency(monthlyRevenue)}
              caption="Live recurring membership revenue feeding the next draw."
            />
            <StatCard
              label="Charity routed"
              value={formatCurrency(charityTotal)}
              caption="Direct membership and independent donations tracked in-platform."
            />
            <StatCard
              label="Jackpot rule"
              value="40%"
              caption="Unclaimed 5-match funds roll forward automatically."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          {
            icon: Sparkles,
            title: "Subscription-led access",
            copy: "Monthly and yearly plans unlock score tracking, draw entry, and persistent charity contributions.",
          },
          {
            icon: Trophy,
            title: "Draws with real logic",
            copy: "Run fair random draws or weighted simulations based on score frequency before you publish live results.",
          },
          {
            icon: HeartHandshake,
            title: "Built around impact",
            copy: "Users choose a charity from day one and can raise their contribution or donate independently at any time.",
          },
        ].map((item) => (
          <Card key={item.title} className="border border-white/10 bg-white/5">
            <CardContent className="space-y-4 pt-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Featured charities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Charity stories that stay in the foreground
            </h2>
          </div>
          <LinkButton href="/charities" variant="ghost" className="hidden md:inline-flex">
            View all
          </LinkButton>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredCharities.map((charity) => (
            <Card key={charity.id} className="overflow-hidden border border-white/10 bg-white/5">
              <Image
                src={charity.imageUrl}
                alt={charity.name}
                width={1200}
                height={720}
                className="h-72 w-full object-cover"
              />
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  {charity.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">{charity.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {charity.description}
                  </p>
                </div>
                <p className="text-sm text-emerald-200">{charity.impactBlurb}</p>
                <LinkButton href={`/charities/${charity.slug}`} variant="ghost" className="px-0">
                  Learn more <ArrowRight className="size-4" />
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-white/5">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Prize logic
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Each subscription funds prize tiers and charity allocation in one motion.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Members choose their charity share from a minimum of{" "}
                {formatPercent(10)} upward. The prize pool auto-splits every month:
                40% to jackpot, 35% to 4-match, and 25% to 3-match.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ["5-match jackpot", "40%", "Rolls over if there is no tier-5 winner."],
                ["4-match rewards", "35%", "Split equally across all verified winners."],
                ["3-match rewards", "25%", "Keeps the lower-tier wins emotionally meaningful."],
              ].map(([title, share, caption]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{title}</p>
                    <p className="text-2xl font-semibold text-emerald-200">{share}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
