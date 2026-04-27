import { AdminSubscriptionsManager } from "@/components/forms/admin-subscriptions-manager";
import { appStore } from "@/lib/app-store";

export default async function AdminSubscriptionsPage() {
  const snapshot = await appStore.getAdminSnapshot();

  return (
    <AdminSubscriptionsManager
      subscriptions={snapshot.subscriptions}
      users={snapshot.users}
    />
  );
}
