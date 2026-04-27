import { WinnerReviewPanel } from "@/components/forms/winner-review-panel";
import { appStore } from "@/lib/app-store";

export default async function AdminWinnersPage() {
  const snapshot = await appStore.getAdminSnapshot();

  return (
    <WinnerReviewPanel
      claims={snapshot.winners}
      users={snapshot.users}
      draws={snapshot.draws}
    />
  );
}
