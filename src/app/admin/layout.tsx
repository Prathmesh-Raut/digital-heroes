import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShell
      user={user}
      title="Live operations, verification, and draw control."
      description="The admin surface is built for reviewing subscription health, simulating prize logic, managing charity content, and closing out winner payouts."
    >
      {children}
    </AdminShell>
  );
}
