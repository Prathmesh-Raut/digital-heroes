import { PLAN_DEFINITIONS } from "@/lib/constants";
import { LinkButton } from "@/components/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Memberships
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Clear subscription plans with draw access and charity contribution baked in.
        </h1>
        <p className="text-sm text-muted-foreground">
          Every plan includes the same core platform access. The difference is billing rhythm, discount, and how much recurring value you want to commit into the prize pool.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {PLAN_DEFINITIONS.map((plan) => (
          <Card key={plan.id} className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-4xl font-semibold">${plan.amount}</p>
                <p className="text-sm text-muted-foreground">{plan.billingLabel}</p>
              </div>
              <p className="text-sm text-muted-foreground">{plan.teaser}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Secure session-based auth and protected routes</li>
                <li>Stableford score entry with rolling five-score retention</li>
                <li>Monthly draw participation and winner verification flows</li>
                <li>Minimum 10% charity contribution with adjustable preference</li>
              </ul>
              <LinkButton href="/sign-up">
                Choose {plan.name}
              </LinkButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
