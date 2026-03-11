"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <Card className="border-gray-200 bg-white">
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

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Apply now</CardTitle>
          <p className="text-sm text-gray-500">
            Submit your business details for verification. We&apos;ll review and get back to you.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Store name</label>
              <input className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500" placeholder="Your store name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Market / Location</label>
              <input className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500" placeholder="e.g. Oyingbo Market, Lagos" />
            </div>
            <Button type="submit">Submit application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
