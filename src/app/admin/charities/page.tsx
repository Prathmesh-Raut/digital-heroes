import { AdminCharityManager } from "@/components/forms/admin-charity-manager";
import { appStore } from "@/lib/app-store";

export default async function AdminCharitiesPage() {
  return <AdminCharityManager charities={await appStore.getCharities()} />;
}
