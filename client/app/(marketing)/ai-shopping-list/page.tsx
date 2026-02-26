"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { LOCATIONS } from "@/lib/constants";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

const WEIGHTS = ["1kg", "2kg", "5kg", "10kg", "25kg", "50kg"];

interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export default function AIShoppingListPage() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "1", name: "Rice", quantity: 2, unit: "5kg" },
    { id: "2", name: "Beans", quantity: 1, unit: "10kg" },
  ]);
  const [location, setLocation] = useState("Lagos");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState("5kg");

  const addItem = () => {
    if (!newName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newName.trim(),
        quantity: newQty,
        unit: newUnit,
      },
    ]);
    setNewName("");
    setNewQty(1);
    setNewUnit("5kg");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Mock totals
  const subtotal = 18500;
  const shopperFee = 1500;
  const logistics = 800;
  const total = subtotal + shopperFee + logistics;
  const estimatedSavings = 2200;
  const timeEstimate = "2–3 hours";

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          AI Shopping List
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add items, set location and delivery date. Get a breakdown with total cost, shopper fee, and time estimate.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We normalize quantities (e.g. 5kg, 10kg) for accurate pricing.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-light-border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.unit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Input
                    placeholder="Item name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="max-w-[140px]"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value) || 1)}
                    className="w-16"
                  />
                  <Select value={newUnit} onValueChange={setNewUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHTS.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="icon" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery date</Label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shopper fee</span>
                  <span className="font-display font-medium">{formatPrice(shopperFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Logistics</span>
                  <span className="font-display font-medium">{formatPrice(logistics)}</span>
                </div>
                <div className="border-t border-light-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-display text-xl font-bold text-accent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-accent-muted p-3">
                  <p className="text-xs text-muted-foreground">Est. time</p>
                  <p className="font-display font-semibold">{timeEstimate}</p>
                </div>
                <div className="rounded-lg border border-amber-highlight/30 bg-amber-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Est. savings vs market</p>
                  <p className="font-display font-semibold text-amber-highlight">
                    {formatPrice(estimatedSavings)}
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Request personal shopper
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
