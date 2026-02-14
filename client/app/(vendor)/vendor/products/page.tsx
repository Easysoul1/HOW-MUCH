"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";

const MOCK_PRODUCTS = [
  { id: "1", name: "Rice 5kg", price: 4850, stock: "In stock" },
  { id: "2", name: "Beans 10kg", price: 7200, stock: "In stock" },
];

export default function ProductManagementPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Product management</h1>
            <p className="mt-1 text-muted-foreground">Add and update your listed items.</p>
          </div>
          <Button><Plus className="mr-2 h-4 w-4" />Add product</Button>
        </div>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_PRODUCTS.map((p, i) => (
          <motion.li key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-dark-border bg-dark-panel">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.stock}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display font-semibold text-accent">{formatPrice(p.price)}</p>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
