"use client";

import { Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/navigation";
import type { UserRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminShell({
  user,
  title,
  description,
  children,
}: {
  user: UserRecord;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <aside className="top-20 h-fit shrink-0 lg:sticky lg:w-80">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="space-y-3 border-b border-white/10 p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <Shield className="size-3.5" />
              Admin controls
            </div>
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {adminNavigation.map((item) => {
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
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Operations
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
