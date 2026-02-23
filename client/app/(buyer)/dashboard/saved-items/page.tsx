"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Trash2, Loader2, AlertCircle, HeartCrack } from "lucide-react";
import { wishlistApi } from "@/lib/api";

const MOCK_SAVED = [
  { id: "1", name: "Rice 5kg", location: "Lagos", price: 4850, trend: "+2%" },
  { id: "2", name: "Beans 10kg", location: "Abuja", price: 7200, trend: "-1%" },
];

export default function SavedItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: any = await wishlistApi.list();
      setItems(data.results || data);
    } catch (err: any) {
      console.error("Failed to fetch wishlist:", err);
      // Fallback
      setItems(MOCK_SAVED);
      setError("Displaying standard mock saved items due to error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string | number) => {
    try {
      // In a real scenario, this would delete
      // await wishlistApi.remove(id);
      setItems(items.filter((item: any) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-black dark:text-white font-bold">Saved items</h1>
        <p className="mt-1 text-black dark:text-gray-300">
          Track prices for items you care about.
        </p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-status-warning" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your saved items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg">
          <HeartCrack className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You haven't saved any items yet.</p>
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-dark-border bg-dark-panel">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-display font-semibold">{item.product_name || item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.location || 'Nationwide'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-accent">
                        {formatPrice(item.price || item.product_price || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.trend || '+0%'} vs last week</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
                        <Link href={`/product/${item.product || item.id}`}>View</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Remove" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
