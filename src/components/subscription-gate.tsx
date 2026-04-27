import { Sparkles } from "lucide-react";

import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubscriptionRecord } from "@/lib/types";

export function SubscriptionGate({
  subscription,
  children,
}: {
  subscription: SubscriptionRecord | null;
  children: React.ReactNode;
}) {
  const active =
    subscription?.status === "active" || subscription?.status === "renewal_due";

  if (active) {
    return children;
  }

  return (
    <Card className="border border-amber-400/20 bg-amber-500/10">
      <CardHeader>
        <Badge variant="outline" className="border-amber-400/30 text-amber-200">
          Access restricted
        </Badge>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-300" />
          Reactivate your membership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-50/80">
        <p>
          Score entry, draw participation, and claim tools are only available to
          active subscribers.
        </p>
        <LinkButton href="/dashboard/subscription">Renew membership</LinkButton>
      </CardContent>
    </Card>
  );
}
