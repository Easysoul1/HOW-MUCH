"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const MOCK_SUBMISSIONS = [
  { id: "1", item: "Rice 5kg", market: "Oyingbo", price: 4850, status: "approved", reward: 150 },
  { id: "2", item: "Beans 10kg", market: "Balogun", price: 7200, status: "pending", reward: 0 },
];

export default function SurveyDashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Survey dashboard</h1>
        <p className="mt-1 text-gray-500">
          Your submissions and status.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_SUBMISSIONS.map((s, i) => (
          <motion.li key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display font-semibold">{s.item}</p>
                  <p className="text-sm text-gray-500">{s.market} · {formatPrice(s.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.status === "approved" ? "success" : "secondary"}>{s.status}</Badge>
                  {s.reward > 0 && <p className="font-display font-semibold text-accent">+₦{s.reward}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
