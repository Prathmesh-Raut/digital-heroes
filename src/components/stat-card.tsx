import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  caption,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  accent?: string;
}) {
  return (
    <Card className={cn("border border-white/10 bg-white/5 backdrop-blur", accent)}>
      <CardHeader className="gap-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>{caption}</span>
        <ArrowRight className="size-4" />
      </CardContent>
    </Card>
  );
}
