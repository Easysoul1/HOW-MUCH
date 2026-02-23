"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/charts/price-chart";
import { formatPrice } from "@/lib/utils";
import { Heart, Search, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import { ordersApi } from "@/lib/api";

const MOCK_CHART = [
  { date: "Mon", price: 4700 },
  { date: "Tue", price: 4750 },
  { date: "Wed", price: 4720 },
  { date: "Thu", price: 4800 },
  { date: "Fri", price: 4850 },
];

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState([
    { label: "Saved items", value: 0, href: "/dashboard/saved-items", icon: Heart },
    { label: "Saved searches", value: 3, href: "/dashboard/saved-searches", icon: Search },
    { label: "Orders", value: 0, href: "/dashboard/orders", icon: ShoppingBag },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const ordersRes: any = await ordersApi.list().catch(() => ({ count: 5 }));
      // We can also plug wishlist API here when ready
      
      setStats([
        { label: "Saved items", value: 12, href: "/dashboard/saved-items", icon: Heart },
        { label: "Saved searches", value: 3, href: "/dashboard/saved-searches", icon: Search },
        { label: "Orders", value: ordersRes.count || ordersRes.results?.length || ordersRes?.length || 0, href: "/dashboard/orders", icon: ShoppingBag },
      ]);
    } catch (err) {
      console.error("Failed to fetch buyer stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-black dark:text-gray-300">
          Your saved items, searches, and quick stats.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-2xl font-bold text-accent relative flex items-center">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : stat.value}
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
                  <Link href={stat.href}>View</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rice 5kg — price trend (Lagos)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              From your saved items
            </p>
          </CardHeader>
          <CardContent>
            <PriceChart data={MOCK_CHART} height={220} color="#00D084" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/search">Search prices</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-shopping-list">AI Shopping List</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/personal-shopper">Personal shopper</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
