"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_QUEUE = [
  { id: "V1", name: "New Market Plus", market: "Lagos", submitted: "2024-05-10" },
  { id: "V2", name: "Abuja Fresh", market: "Abuja", submitted: "2024-05-11" },
];

export default function VendorVerificationQueuePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Vendor verification queue</h1>
        <p className="mt-1 text-gray-500">
          Review and approve or reject vendor applications.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_QUEUE.map((v, i) => (
          <motion.li key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display font-semibold">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.market} · {v.submitted}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
