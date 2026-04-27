"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharityRecord } from "@/lib/types";

export function PublicCharityDirectory({
  charities,
}: {
  charities: CharityRecord[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...new Set(charities.map((charity) => charity.category))],
    [charities],
  );

  const filtered = useMemo(
    () =>
      charities.filter((charity) => {
        const matchesQuery =
          !query ||
          charity.name.toLowerCase().includes(query.toLowerCase()) ||
          charity.tags.join(" ").toLowerCase().includes(query.toLowerCase()) ||
          charity.country.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "all" || charity.category === category;
        return matchesQuery && matchesCategory;
      }),
    [category, charities, query],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 pl-9"
            placeholder="Search by name, tag, or country"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          {categories.map((item) => (
            <option key={item} value={item} className="bg-slate-950">
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((charity) => (
          <Link key={charity.id} href={`/charities/${charity.slug}`}>
            <Card className="h-full overflow-hidden border border-white/10 bg-white/5 transition hover:-translate-y-0.5 hover:bg-white/7">
                <Image
                  src={charity.imageUrl}
                  alt={charity.name}
                  width={1200}
                  height={720}
                  className="h-48 w-full object-cover"
                />
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{charity.category}</Badge>
                  {charity.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{charity.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {charity.description}
                  </p>
                </div>
                <p className="text-sm text-emerald-200">{charity.impactBlurb}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
