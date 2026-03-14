"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const MOCK_REQUESTS = [
  { id: "R-001", items: 5, total: 18500, location: "Lagos, Ikeja", status: "pending" },
  { id: "R-002", items: 3, total: 9200, location: "Lagos, Yaba", status: "accepted" },
];

export default function ActiveRequestsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Active requests</h1>
        <p className="mt-1 text-gray-500">
          Accept and fulfill shopper requests.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_REQUESTS.map((r, i) => (
          <motion.li key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-mono text-sm">{r.id}</p>
                  <p className="text-sm text-gray-500">{r.items} items · {r.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display font-semibold text-accent">{formatPrice(r.total)}</p>
                  <Button size="sm">{r.status === "pending" ? "Accept" : "View"}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
