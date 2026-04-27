import { DashboardShell } from "@/components/dashboard-shell";
import { appStore } from "@/lib/app-store";
import { requireUser } from "@/lib/guards";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const subscription = await appStore.getUserSubscription(user.id);

  return (
    <DashboardShell
      user={user}
      subscription={subscription}
      title="A calmer way to track rounds, prize chances, and impact."
      description="Every view here is backed by the same draw, score, payment, and charity model, so the member experience stays consistent from signup to payout."
    >
      {children}
    </DashboardShell>
  );
}
