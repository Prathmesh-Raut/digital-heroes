"use client";

import { useSyncExternalStore } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatDate } from "@/lib/format";
import type { ScoreRecord } from "@/lib/types";

export function ScoreTrendChart({ scores }: { scores: ScoreRecord[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const data = [...scores]
    .reverse()
    .map((score) => ({
      date: formatDate(score.playedAt, "MMM d"),
      value: score.value,
    }));

  if (!mounted) {
    return <div className="h-72 w-full animate-pulse rounded-2xl bg-white/5" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
          <YAxis
            domain={[0, 45]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4ade80"
            strokeWidth={3}
            dot={{ fill: "#fb7185", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
