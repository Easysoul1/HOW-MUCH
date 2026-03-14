"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/data/verified-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS } from "@/lib/constants";
import { MapPin, Store } from "lucide-react";

const MOCK_VENDORS = [
  { id: "1", name: "Mama Put Market", market: "Oyingbo Market", location: "Lagos", verified: true },
  { id: "2", name: "Balogun Foods", market: "Balogun Market", location: "Lagos", verified: true },
  { id: "3", name: "Ikeja Fresh", market: "Ikeja", location: "Lagos", verified: false },
  { id: "4", name: "Agege Central", market: "Agege Market", location: "Lagos", verified: true },
];

export default function VendorDirectoryPage() {
  const [location, setLocation] = useState("Lagos");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = MOCK_VENDORS.filter((v) => {
    if (verifiedOnly && !v.verified) return false;
    if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
    return v.location === location;
  });

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Vendor directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Filter by location and verified status. Preview storefronts.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Input
            placeholder="Search vendors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-light-border"
            />
            Verified only
          </label>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full transition-shadow hover:shadow-md" asChild>
                <Link href={`/vendors/${v.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Store className="h-6 w-6" />
                      </div>
                      {v.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <h3 className="mt-3 font-display font-semibold">{v.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {v.market}, {v.location}
                    </p>
                    <p className="mt-3 text-sm text-accent">View storefront →</p>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
