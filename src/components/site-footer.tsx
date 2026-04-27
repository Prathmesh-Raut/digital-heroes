import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xl text-sm text-muted-foreground">
            A modern subscription product for golfers who want every round to fund something bigger.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
          <Link href="/charities" className="transition hover:text-foreground">
            Charities
          </Link>
          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin" className="transition hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
