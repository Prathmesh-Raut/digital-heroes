"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/format";

export function AdminRevenueChart({
  data,
}: {
  data: Array<{ month: string; subscriptions: number; charity: number; payouts: number }>;
}) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-80 w-full animate-pulse rounded-2xl bg-white/5" />;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
            }
            contentStyle={{
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          />
          <Bar dataKey="subscriptions" fill="#22c55e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="charity" fill="#fb7185" radius={[6, 6, 0, 0]} />
          <Bar dataKey="payouts" fill="#facc15" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
