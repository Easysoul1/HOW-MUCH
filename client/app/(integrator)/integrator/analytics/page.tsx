"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "@/components/charts/price-chart";
import { formatNumber } from "@/lib/utils";

const MOCK_USAGE = [
  { date: "Mon", price: 1200 },
  { date: "Tue", price: 1800 },
  { date: "Wed", price: 1500 },
  { date: "Thu", price: 2200 },
  { date: "Fri", price: 2800 },
];

export default function UsageAnalyticsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Usage analytics</h1>
        <p className="mt-1 text-gray-500">
          API calls over time and limits.
        </p>
      </motion.div>

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Requests (30d)</CardTitle>
          <p className="font-display text-3xl font-bold text-accent">{formatNumber(45200)}</p>
        </CardHeader>
        <CardContent>
          <PriceChart data={MOCK_USAGE} height={240} />
        </CardContent>
      </Card>
    </div>
  );
}
