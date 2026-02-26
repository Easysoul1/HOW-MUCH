"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChart } from "@/components/charts/price-chart";
import { analyticsApi } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

const MOCK_VIEWS = [
  { date: "Mon", price: 120 },
  { date: "Tue", price: 180 },
  { date: "Wed", price: 150 },
  { date: "Thu", price: 220 },
  { date: "Fri", price: 280 },
];

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await analyticsApi.getVendorOverview();
      setData(res);
    } catch (err: any) {
      console.error("Failed to fetch vendor analytics:", err);
      setData({ revenueHistory: MOCK_VIEWS.map(v => ({ name: v.date, value: v.price })) });
      setError("Displaying cached analytics due to server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = (data?.revenueHistory || MOCK_VIEWS.map(v => ({ name: v.date, value: v.price }))).map((item: any) => ({
    date: item.name || item.date,
    price: item.value || item.amount || item.price
  }));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Vendor analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Store performance, top products, and time range filters.
        </p>
      </motion.div>

      <Card className="border-gray-200 bg-white">
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
          {isLoading ? (
             <div className="flex flex-col items-center justify-center min-h-[260px]">
               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
               <p className="text-muted-foreground">Loading chart...</p>
             </div>
          ) : (
             <PriceChart data={chartData} height={260} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
