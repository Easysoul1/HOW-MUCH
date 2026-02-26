"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { PriceChart } from "@/components/charts/price-chart";

const MOCK_EARNINGS = [
  { date: "Week 1", price: 5000 },
  { date: "Week 2", price: 7200 },
  { date: "Week 3", price: 4800 },
  { date: "Week 4", price: 4000 },
];

export default function EarningsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Earnings</h1>
        <p className="mt-1 text-gray-500">
          Your shopper fees and payout history.
        </p>
      </motion.div>

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Total (30d)</CardTitle>
          <p className="font-display text-3xl font-bold text-accent">{formatPrice(21000)}</p>
        </CardHeader>
        <CardContent>
          <PriceChart data={MOCK_EARNINGS} height={220} />
        </CardContent>
      </Card>
    </div>
  );
}
