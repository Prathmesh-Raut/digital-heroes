"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WinnerClaimRecord } from "@/lib/types";

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the file."));
    reader.readAsDataURL(file);
  });
}

export function WinnerProofForm({ claims }: { claims: WinnerClaimRecord[] }) {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, File | null>>({});

  async function submitProof(claimId: string) {
    const file = files[claimId];
    if (!file) {
      toast.error("Choose an image before submitting.");
      return;
    }

    const proofImageUrl = await fileToDataUrl(file);
    const response = await fetch("/api/winners/proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, proofImageUrl }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to submit proof.");
      return;
    }

    toast.success("Proof submitted.");
    router.refresh();
  }

  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Winner verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {claims.map((claim) => (
          <div key={claim.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="mb-3">
              <p className="font-medium">Tier {claim.matchTier} claim</p>
              <p className="text-sm text-muted-foreground">
                Status: {claim.verificationStatus.replaceAll("_", " ")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFiles((current) => ({
                    ...current,
                    [claim.id]: event.target.files?.[0] ?? null,
                  }))
                }
                className="block w-full text-sm text-muted-foreground"
              />
              <Button onClick={() => submitProof(claim.id)}>Upload proof</Button>
            </div>
          </div>
        ))}
        {!claims.length ? (
          <p className="text-sm text-muted-foreground">No claims awaiting proof.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
