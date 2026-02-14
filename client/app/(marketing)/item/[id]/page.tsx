"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/data/verified-badge";
import { AnimatedPrice } from "@/components/data/animated-price";
import { PriceChart } from "@/components/charts/price-chart";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGES } from "@/lib/images";
import { formatPrice, formatPercent } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Shield, TrendingUp, Clock } from "lucide-react";

const MOCK_PRODUCT = {
  name: "Rice (Premium) 5kg",
  category: "Staples",
  currentPrice: 4850,
  volatility: 4.2,
  fraudRisk: "low",
  daily: [
    { date: "Mon", price: 4700, label: "Mon" },
    { date: "Tue", price: 4750, label: "Tue" },
    { date: "Wed", price: 4720, label: "Wed" },
    { date: "Thu", price: 4800, label: "Thu" },
    { date: "Fri", price: 4850, label: "Fri" },
  ],
  monthly: [
    { date: "Jan", price: 4200 },
    { date: "Feb", price: 4350 },
    { date: "Mar", price: 4500 },
    { date: "Apr", price: 4600 },
    { date: "May", price: 4850 },
  ],
  yearly: [
    { date: "2023 Q1", price: 4000 },
    { date: "2023 Q2", price: 4300 },
    { date: "2023 Q3", price: 4500 },
    { date: "2023 Q4", price: 4700 },
    { date: "2024 Q1", price: 4850 },
  ],
  heatmap: [
    { location: "Lagos", price: 4850 },
    { location: "Abuja", price: 5100 },
    { location: "Ibadan", price: 4600 },
    { location: "P.Harcourt", price: 4950 },
    { location: "Kano", price: 4700 },
  ],
  vendors: [
    { name: "Mama Put Market", market: "Oyingbo", price: 4850, verified: true },
    { name: "Balogun Foods", market: "Balogun", price: 5100, verified: true },
    { name: "Ikeja Fresh", market: "Ikeja", price: 4600, verified: false },
  ],
  logisticsPreview: 500,
};

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-light-panel/50 to-transparent dark:from-dark-panel/30 pointer-events-none" aria-hidden />
      <div className="container relative px-4 py-8 md:px-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to search
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-light-panel shadow-depth-2 dark:bg-dark-elevated sm:h-40 sm:w-56">
              <OptimizedImage
                src={IMAGES.riceProduct}
                alt={MOCK_PRODUCT.name}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                {MOCK_PRODUCT.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{MOCK_PRODUCT.category}</Badge>
                {MOCK_PRODUCT.fraudRisk === "low" && (
                  <Badge variant="success">Low fraud risk</Badge>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Updated 2 hours ago
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-depth-1">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span>Nationwide price heatmap</span>
                  <AnimatedPrice value={MOCK_PRODUCT.currentPrice} className="text-2xl text-accent" />
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-light-border bg-light-panel dark:border-dark-border dark:bg-dark-elevated">
                      <th className="p-3 text-left font-medium">Location</th>
                      <th className="p-3 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PRODUCT.heatmap.map((row) => (
                      <tr key={row.location} className="border-b border-light-border dark:border-dark-border">
                        <td className="p-3">{row.location}</td>
                        <td className="p-3 text-right font-display font-medium">
                          {formatPrice(row.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-depth-1">
            <CardHeader>
              <CardTitle>Price history</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Volatility: {formatPercent(MOCK_PRODUCT.volatility)}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily">
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                  <PriceChart data={MOCK_PRODUCT.daily} />
                </TabsContent>
                <TabsContent value="monthly">
                  <PriceChart data={MOCK_PRODUCT.monthly} />
                </TabsContent>
                <TabsContent value="yearly">
                  <PriceChart data={MOCK_PRODUCT.yearly} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PRODUCT.vendors.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between rounded-lg border border-light-border p-3 dark:border-dark-border"
                >
                  <div className="flex items-center gap-2">
                    {v.verified && <VerifiedBadge size="sm" />}
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.market}</p>
                    </div>
                  </div>
                  <p className="font-display font-semibold">{formatPrice(v.price)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Logistics preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Est. delivery cost from nearest vendor
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-accent">
                {formatPrice(MOCK_PRODUCT.logisticsPreview)}
              </p>
              <Button className="mt-4 w-full" variant="accent" asChild>
                <Link href="/suggestive-buy">Suggestive buy engine</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium">Suggestive buy intelligence</p>
                  <p className="text-sm text-muted-foreground">
                    Compare total cost (item + logistics) across vendors. We recommend the best total price.
                  </p>
                  <Button variant="link" className="mt-2 px-0" asChild>
                    <Link href="/suggestive-buy">Open engine →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
