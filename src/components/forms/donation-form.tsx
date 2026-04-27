"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DonationForm({ charityId }: { charityId: string }) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/donations/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charityId,
        amount: Number(formData.get("amount")),
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Unable to process donation.");
      return;
    }

    if (typeof payload.sessionUrl === "string" && payload.sessionUrl.startsWith("http")) {
      window.location.assign(payload.sessionUrl);
      return;
    }

    toast.success("Donation recorded.");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input name="amount" type="number" min={5} defaultValue={25} className="h-11 sm:max-w-44" />
      <Button type="submit">Donate directly</Button>
    </form>
  );
}
