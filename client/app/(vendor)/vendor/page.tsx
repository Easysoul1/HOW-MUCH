"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Package, TrendingUp, Eye } from "lucide-react";

export default function VendorApplicationPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Vendor application</h1>
        <p className="mt-1 text-muted-foreground">
          Apply to list your store and products on HOW MUCH.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-dark-border bg-dark-panel">
          <CardHeader>
            <CardTitle>Already a vendor?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/vendor/dashboard">Go to vendor dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dark-border bg-dark-panel">
        <CardHeader>
          <CardTitle>Apply now</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submit your business details for verification. We&apos;ll review and get back to you.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Store name</label>
              <input className="mt-1 w-full rounded-lg border border-dark-border bg-dark-elevated px-4 py-2" placeholder="Your store name" />
            </div>
            <div>
              <label className="text-sm font-medium">Market / Location</label>
              <input className="mt-1 w-full rounded-lg border border-dark-border bg-dark-elevated px-4 py-2" placeholder="e.g. Oyingbo Market, Lagos" />
            </div>
            <Button type="submit">Submit application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
