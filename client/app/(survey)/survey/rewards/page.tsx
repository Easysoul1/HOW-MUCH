"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default function RewardTrackerPage() {
  const totalEarned = 1250;
  const pending = 300;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Reward tracker</h1>
        <p className="mt-1 text-muted-foreground">
          Earnings from approved submissions.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-dark-border bg-dark-panel">
          <CardHeader>
            <CardTitle>Total earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-accent">{formatPrice(totalEarned)}</p>
          </CardContent>
        </Card>
        <Card className="border-dark-border bg-dark-panel">
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-amber-highlight">{formatPrice(pending)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
