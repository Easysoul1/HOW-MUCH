"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/data/verified-badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGES } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { MapPin, Phone, User, Star } from "lucide-react";

const MOCK_VENDOR = {
  name: "Mama Put Market",
  market: "Oyingbo Market",
  location: "Lagos",
  verified: true,
  rating: 4.8,
  phone: "+234 800 000 0000",
  banner: IMAGES.vendorBanner,
  items: [
    { name: "Rice 5kg", price: 4850, image: IMAGES.riceProduct },
    { name: "Beans 10kg", price: 7200, image: IMAGES.beansProduct },
    { name: "Garri 2kg", price: 1200, image: IMAGES.grid1 },
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-light-border shadow-depth-2">
          <div className="relative aspect-[21/9] min-h-[180px] bg-light-panel">
            <OptimizedImage
              src={MOCK_VENDOR.banner}
              alt={MOCK_VENDOR.name}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{MOCK_VENDOR.name}</h1>
                    {MOCK_VENDOR.verified && <VerifiedBadge />}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-foreground/90">
                    <MapPin className="h-4 w-4" />
                    {MOCK_VENDOR.market}, {MOCK_VENDOR.location}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-foreground">
                    <Star className="h-4 w-4 fill-amber-highlight text-amber-highlight" />
                    <span className="font-medium">{MOCK_VENDOR.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="gap-2 bg-background/90 backdrop-blur-sm">
                    <Phone className="h-4 w-4" />
                    Contact
                  </Button>
                  <Button className="gap-2 bg-background/90 backdrop-blur-sm" asChild>
                    <Link href="/personal-shopper">
                      <User className="h-4 w-4" />
                      Use personal shopper
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-8 shadow-depth-1">
          <CardContent className="p-0">
            <div className="border-b border-light-border px-5 py-4">
              <h2 className="font-display font-semibold">Items</h2>
              <p className="text-sm text-muted-foreground">Updated 1 hour ago</p>
            </div>
            <ul className="divide-y divide-light-border">
              {MOCK_VENDOR.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-light-panel">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <span className="flex-1 font-medium min-w-0 truncate pr-4">{item.name}</span>
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
