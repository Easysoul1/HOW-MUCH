"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShopperApplicationPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Personal shopper application</h1>
        <p className="mt-1 text-gray-500">
          Apply to become a verified personal shopper and earn from orders.
        </p>
      </motion.div>

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Apply now</CardTitle>
          <p className="text-sm text-gray-500">
            We verify identity and location. Once approved, you can accept requests in your area.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium">Primary location</label>
              <input className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2" placeholder="e.g. Lagos, Ikeja" />
            </div>
            <Button type="submit">Submit application</Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Already a shopper? <Link href="/shopper/dashboard" className="text-accent hover:underline">Go to dashboard</Link>
      </p>
    </div>
  );
}
