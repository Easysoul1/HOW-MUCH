"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LiveSearchBar } from "@/components/search/live-search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/data/verified-badge";
import { MiniTrend } from "@/components/charts/mini-trend";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDistance } from "@/lib/utils";
import { LOCATIONS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { AnimatedPrice } from "@/components/data/animated-price";
import { HoverLift } from "@/components/motion/hover-lift";
import { Phone, User, MapPin, Filter, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_RESULTS = [
  { id: "1", productName: "Rice (Premium)", vendorName: "Mama Put Market", market: "Oyingbo Market", location: "Lagos", price: 4850, distance: 2.3, verified: true, trend: [4200, 4400, 4600, 4700, 4850], updatedAt: "2 hours ago", image: IMAGES.vendorStorefront },
  { id: "2", productName: "Rice (Premium)", vendorName: "Balogun Foods", market: "Balogun Market", location: "Lagos", price: 5100, distance: 5.1, verified: true, trend: [5000, 5050, 5100, 5080, 5100], updatedAt: "1 hour ago", image: IMAGES.vendorStorefront },
  { id: "3", productName: "Rice (Premium)", vendorName: "Ikeja Fresh", market: "Ikeja", location: "Lagos", price: 4600, distance: 8.2, verified: false, trend: [4500, 4550, 4600, 4580, 4600], updatedAt: "5 hours ago", image: IMAGES.marketArea },
  { id: "4", productName: "Rice (Premium)", vendorName: "Agege Central", market: "Agege Market", location: "Lagos", price: 4400, distance: 12, verified: true, trend: [4300, 4350, 4400, 4420, 4400], updatedAt: "3 hours ago", image: IMAGES.marketArea },
];

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "Rice";
  const location = searchParams.get("location") ?? "Lagos";
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    let list = [...MOCK_RESULTS];
    if (verifiedOnly) list = list.filter((r) => r.verified);
    list = list.filter((r) => r.price >= priceRange[0] && r.price <= priceRange[1]);
    return list;
  }, [verifiedOnly, priceRange]);

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <LiveSearchBar variant="sticky" />
      </div>

      <div className="flex gap-6">
        {/* Sticky filter panel */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-light-border bg-white p-4">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-light-border"
                />
                Verified vendors only
              </label>
              <div>
                <p className="text-sm font-medium">Price range (₦)</p>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0] || ""}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1] || ""}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value) || 0])
                    }
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} results for &quot;{q}&quot; in {location}
          </p>
          <ul className="space-y-5">
            {results.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <HoverLift y={-4}>
                  <Card className="overflow-hidden border border-light-border shadow-depth-1 transition-shadow hover:shadow-depth-2">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row sm:items-stretch">
                        <div className="relative hidden w-40 shrink-0 overflow-hidden sm:block">
                          <OptimizedImage
                            src={r.image}
                            alt={r.market}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col sm:flex-row sm:items-center">
                          <div className="flex-1 p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display font-semibold">{r.productName}</h3>
                              {r.verified && <VerifiedBadge size="sm" />}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {r.vendorName} · {r.market}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {formatDistance(r.distance)}
                              </span>
                              <span>{r.location}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Updated {r.updatedAt}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 border-t border-light-border bg-light-panel/50 p-4 sm:border-t-0 sm:border-l sm:px-6">
                            <MiniTrend
                              data={r.trend}
                              trend={
                                r.trend[r.trend.length - 1] > r.trend[0]
                                  ? "up"
                                  : r.trend[r.trend.length - 1] < r.trend[0]
                                  ? "down"
                                  : "flat"
                              }
                            />
                            <div className="text-right">
                              <AnimatedPrice value={r.price} className="text-xl font-semibold text-primary" />
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="secondary" asChild>
                                  <Link href={`/item/${r.id}`}>Details</Link>
                                </Button>
                                <Button size="sm" variant="ghost" className="gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  Call
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1" asChild>
                                  <Link href="/personal-shopper">
                                    <User className="h-3.5 w-3.5" />
                                    Shopper
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </HoverLift>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="container px-4 py-8">
          <Skeleton className="mb-6 h-12 w-full max-w-3xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  );
}
