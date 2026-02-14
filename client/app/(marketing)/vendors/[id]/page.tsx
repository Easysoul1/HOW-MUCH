"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/data/verified-badge";
import { formatPrice } from "@/lib/utils";
import { MapPin, Phone, User, Star } from "lucide-react";

const MOCK_VENDOR = {
  name: "Mama Put Market",
  market: "Oyingbo Market",
  location: "Lagos",
  verified: true,
  rating: 4.8,
  phone: "+234 800 000 0000",
  items: [
    { name: "Rice 5kg", price: 4850 },
    { name: "Beans 10kg", price: 7200 },
    { name: "Garri 2kg", price: 1200 },
  ],
};

export default function VendorStorefrontPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/vendors" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to directory
        </Link>

        <div className="mt-6 rounded-2xl border border-light-border bg-light-panel p-6 dark:border-dark-border dark:bg-dark-panel md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{MOCK_VENDOR.name}</h1>
                {MOCK_VENDOR.verified && <VerifiedBadge />}
              </div>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {MOCK_VENDOR.market}, {MOCK_VENDOR.location}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-highlight text-amber-highlight" />
                <span className="font-medium">{MOCK_VENDOR.rating}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </Button>
              <Button className="gap-2" asChild>
                <Link href="/personal-shopper">
                  <User className="h-4 w-4" />
                  Use personal shopper
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="p-0">
            <div className="border-b border-light-border px-5 py-3 dark:border-dark-border">
              <h2 className="font-display font-semibold">Items</h2>
            </div>
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {MOCK_VENDOR.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="font-display font-semibold text-accent">
                    {formatPrice(item.price)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
