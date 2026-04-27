import { AdminUsersManager } from "@/components/forms/admin-users-manager";
import { appStore } from "@/lib/app-store";

export default async function AdminUsersPage() {
  const snapshot = await appStore.getAdminSnapshot();

  return (
    <AdminUsersManager
      users={snapshot.users}
      subscriptions={snapshot.subscriptions}
      charities={snapshot.charities}
      scores={snapshot.scores}
    />
  );
}
