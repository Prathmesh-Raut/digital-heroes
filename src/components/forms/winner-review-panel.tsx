"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { DrawRecord, UserRecord, WinnerClaimRecord } from "@/lib/types";

export function WinnerReviewPanel({
  claims,
  users,
  draws,
}: {
  claims: WinnerClaimRecord[];
  users: UserRecord[];
  draws: DrawRecord[];
}) {
  const router = useRouter();

  async function review(
    claimId: string,
    verificationStatus: "approved" | "rejected",
    payoutStatus?: "pending" | "paid",
  ) {
    const response = await fetch(`/api/admin/winners/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationStatus, payoutStatus }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to review claim.");
      return;
    }

    toast.success("Claim updated.");
    router.refresh();
  }

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Winner review queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {claims.map((claim) => {
          const user = users.find((item) => item.id === claim.userId);
          const draw = draws.find((item) => item.id === claim.drawId);
          return (
            <div key={claim.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">
                    {user?.fullName} · Tier {claim.matchTier}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {draw?.label} · {formatCurrency(claim.amount)} · {claim.verificationStatus.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => review(claim.id, "approved", "pending")}>
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => review(claim.id, "approved", "paid")}
                  >
                    Mark paid
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => review(claim.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              {claim.proofImageUrl ? (
                <a
                  href={claim.proofImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-emerald-200"
                >
                  Open uploaded proof
                </a>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
