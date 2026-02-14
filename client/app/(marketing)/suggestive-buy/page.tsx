"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Truck, MapPin, ArrowRight } from "lucide-react";

const MOCK_OPTIONS = [
  { vendor: "Mama Put Market", market: "Oyingbo", itemPrice: 4850, logistics: 500, total: 5350 },
  { vendor: "Agege Central", market: "Agege", itemPrice: 4400, logistics: 1200, total: 5600 },
  { vendor: "Balogun Foods", market: "Balogun", itemPrice: 5100, logistics: 400, total: 5500 },
];

export default function SuggestiveBuyPage() {
  const [selected, setSelected] = useState(0);
  const best = MOCK_OPTIONS.reduce((a, b) => (a.total < b.total ? a : b));
  const savings = Math.max(...MOCK_OPTIONS.map((o) => o.total)) - best.total;

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Suggestive buy engine
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compare total cost (item + shipping) and see recommended option.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rice (Premium) 5kg — Lagos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Route intelligence: we factor distance and logistics into total cost.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_OPTIONS.map((opt, i) => (
              <motion.div
                key={opt.vendor}
                layout
                className={`rounded-xl border-2 p-4 transition-colors ${
                  selected === i
                    ? "border-accent bg-accent-muted dark:bg-accent-muted"
                    : "border-light-border dark:border-dark-border"
                }`}
                onClick={() => setSelected(i)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{opt.vendor}</p>
                      <p className="text-sm text-muted-foreground">{opt.market}</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-4 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Item</p>
                      <p className="font-display font-semibold">{formatPrice(opt.itemPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Logistics</p>
                        <p className="font-display font-semibold">{formatPrice(opt.logistics)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-display text-lg font-bold text-accent">
                        {formatPrice(opt.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-6 border-accent/50 bg-accent-muted/30 dark:bg-accent-muted/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="text-sm text-muted-foreground">Recommended (lowest total)</p>
              <p className="font-display text-xl font-bold">{best.vendor}</p>
              <p className="text-lg text-accent">{formatPrice(best.total)} total</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">You save</p>
              <p className="font-display text-2xl font-bold text-accent">
                {formatPrice(savings)}
              </p>
              <p className="text-sm">vs highest option</p>
            </div>
            <Button size="lg">
              Proceed with {best.vendor}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
