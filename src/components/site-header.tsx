import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { LinkButton } from "@/components/link-button";
import { siteNavigation } from "@/lib/navigation";
import { getViewerContext } from "@/lib/guards";

export async function SiteHeader() {
  const viewer = await getViewerContext();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-6 md:flex">
          {siteNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {viewer.user ? (
            <>
              <LinkButton
                href={viewer.user.role === "admin" ? "/admin" : "/dashboard"}
                variant="ghost"
              >
                Open app
              </LinkButton>
              <form action="/api/auth/logout" method="post">
                <button className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <LinkButton href="/sign-in" variant="ghost">
                Sign in
              </LinkButton>
              <LinkButton href="/sign-up">Subscribe</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
