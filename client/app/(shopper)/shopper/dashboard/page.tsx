"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, TrendingUp } from "lucide-react";

export default function ShopperDashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Shopper dashboard</h1>
        <p className="mt-1 text-gray-500">
          Active requests, earnings, and performance.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Active requests</p>
            <p className="font-display text-2xl font-bold text-accent">2</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Completed (30d)</p>
            <p className="font-display text-2xl font-bold text-accent">14</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Earnings (30d)</p>
            <p className="font-display text-2xl font-bold text-accent">{formatPrice(21000)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5">
          <h3 className="font-display font-semibold">Quick actions</h3>
          <div className="mt-4 flex gap-3">
            <Button asChild><Link href="/shopper/requests">View active requests</Link></Button>
            <Button variant="outline" asChild><Link href="/shopper/earnings">View earnings</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
