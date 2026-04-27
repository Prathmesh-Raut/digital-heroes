"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "@/lib/navigation";
import type { SubscriptionRecord, UserRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardShell({
  user,
  subscription,
  title,
  description,
  children,
}: {
  user: UserRecord;
  subscription: SubscriptionRecord | null;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <aside className="top-20 h-fit shrink-0 lg:sticky lg:w-72">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="space-y-2 border-b border-white/10 p-5">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
              <p className="text-muted-foreground">Subscription</p>
              <p className="font-medium capitalize">
                {subscription?.status ?? "inactive"}
              </p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {dashboardNavigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-3">
            <form action="/api/auth/logout" method="post">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">
                <LogOut className="size-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Member dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
