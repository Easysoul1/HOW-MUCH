"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const MOCK_PENDING = [
  { id: "S1", item: "Rice 5kg", market: "Oyingbo", price: 4850, submitted: "2h ago" },
  { id: "S2", item: "Beans 10kg", market: "Balogun", price: 7100, submitted: "5h ago" },
];

export default function SurveyValidationPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Survey validation</h1>
        <p className="mt-1 text-muted-foreground">
          Approve or flag crowdsourced price submissions.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_PENDING.map((s, i) => (
          <motion.li key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-dark-border bg-dark-panel">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display font-semibold">{s.item}</p>
                  <p className="text-sm text-muted-foreground">{s.market} · {formatPrice(s.price)} · {s.submitted}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Flag</Button>
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
