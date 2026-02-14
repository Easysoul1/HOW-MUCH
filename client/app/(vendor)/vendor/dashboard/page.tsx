"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "@/components/charts/price-chart";
import { formatPrice, formatNumber } from "@/lib/utils";
import { TrendingUp, Eye, Package } from "lucide-react";

const MOCK_CHART = [
  { date: "Mon", price: 12 },
  { date: "Tue", price: 18 },
  { date: "Wed", price: 15 },
  { date: "Thu", price: 22 },
  { date: "Fri", price: 28 },
];

export default function VendorDashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Vendor dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Views, performance, and product management.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-dark-border bg-dark-panel">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Store views (7d)</p>
            <p className="font-display text-2xl font-bold text-accent">1,240</p>
          </CardContent>
        </Card>
        <Card className="border-dark-border bg-dark-panel">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Products listed</p>
            <p className="font-display text-2xl font-bold text-accent">24</p>
          </CardContent>
        </Card>
        <Card className="border-dark-border bg-dark-panel">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Inquiries (30d)</p>
            <p className="font-display text-2xl font-bold text-accent">18</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dark-border bg-dark-panel">
        <CardHeader>
          <CardTitle>Views over time</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceChart data={MOCK_CHART} height={220} />
        </CardContent>
      </Card>
    </div>
  );
}
