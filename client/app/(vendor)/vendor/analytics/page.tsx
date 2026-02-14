"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChart } from "@/components/charts/price-chart";
import { formatNumber } from "@/lib/utils";

const MOCK_VIEWS = [
  { date: "Mon", price: 120 },
  { date: "Tue", price: 180 },
  { date: "Wed", price: 150 },
  { date: "Thu", price: 220 },
  { date: "Fri", price: 280 },
];

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Vendor analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Store performance, top products, and time range filters.
        </p>
      </motion.div>

      <Card className="border-dark-border bg-dark-panel">
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <Tabs defaultValue="7d">
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <PriceChart data={MOCK_VIEWS} height={260} />
        </CardContent>
      </Card>
    </div>
  );
}
