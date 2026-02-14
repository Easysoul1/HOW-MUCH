"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/charts/price-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatPercent } from "@/lib/utils";
import { Download, TrendingUp } from "lucide-react";

const MOCK_SERIES = {
  rice: [
    { date: "Jan", price: 4200 },
    { date: "Feb", price: 4350 },
    { date: "Mar", price: 4500 },
    { date: "Apr", price: 4600 },
    { date: "May", price: 4850 },
    { date: "Jun", price: 4900 },
  ],
  beans: [
    { date: "Jan", price: 6500 },
    { date: "Feb", price: 6800 },
    { date: "Mar", price: 7000 },
    { date: "Apr", price: 7200 },
    { date: "May", price: 7100 },
    { date: "Jun", price: 7300 },
  ],
};

export default function PriceHistoryPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const inflationIndicator = 12.5;
  const seasonalNote = "Peak season typically Q3 for grains.";

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Price history & analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Interactive charts, inflation indicator, seasonal trends. Export to CSV.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rice 5kg — Lagos</CardTitle>
              <p className="text-sm text-muted-foreground">Nationwide benchmark</p>
            </CardHeader>
            <CardContent>
              <PriceChart data={MOCK_SERIES.rice} height={240} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Beans 10kg — Lagos</CardTitle>
              <p className="text-sm text-muted-foreground">Nationwide benchmark</p>
            </CardHeader>
            <CardContent>
              <PriceChart data={MOCK_SERIES.beans} height={240} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inflation indicator (YoY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-amber-highlight">
              +{inflationIndicator}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Average staple basket vs same period last year.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Seasonal trend analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{seasonalNote}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Market comparison and economic commentary available in blog & market reports.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
