import { HeartHandshake, Trophy } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function BrandMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Trophy className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <HeartHandshake className="size-3.5" />
          Prize play with charity impact
        </span>
      </span>
    </Link>
  );
}
