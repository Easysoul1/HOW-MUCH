"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MOCK_ORDERS = [
  { id: "ORD-001", total: 12500, status: "delivered", date: "2024-05-10" },
  { id: "ORD-002", total: 8300, status: "confirmed", date: "2024-05-12" },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Your personal shopper and purchase history.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_ORDERS.map((order, i) => (
          <motion.li
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-dark-border bg-dark-panel">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-mono text-sm">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display font-semibold text-accent">
                    {formatPrice(order.total)}
                  </p>
                  <Badge
                    variant={
                      order.status === "delivered" ? "success" : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="#">View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
