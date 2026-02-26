"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const CODE_SNIPPET = `GET https://api.howmuch.ng/v1/prices?item=rice&weight=5kg&location=lagos
Authorization: Bearer YOUR_API_KEY`;

export default function APIDocumentationPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">API documentation</h1>
        <p className="mt-1 text-gray-500">
          Stripe-style layout. Code snippets and endpoints.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <a href="#overview" className="block text-gray-500 hover:text-foreground">Overview</a>
            <a href="#authentication" className="block text-gray-500 hover:text-foreground">Authentication</a>
            <a href="#prices" className="block text-gray-500 hover:text-foreground">Prices</a>
          </nav>
        </aside>
        <div className="space-y-8">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <h2 id="overview" className="font-display text-lg font-semibold">Overview</h2>
              <p className="mt-2 text-sm text-gray-500">
                Use the HOW MUCH API to fetch real-time grocery prices by item, weight, and location. All responses are JSON.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <h2 id="authentication" className="font-display text-lg font-semibold">Authentication</h2>
              <p className="mt-2 text-sm text-gray-500">
                Include your API key in the Authorization header: Bearer YOUR_API_KEY. Get keys in the API Keys section.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <h2 id="prices" className="font-display text-lg font-semibold">Get prices</h2>
              <p className="mt-2 text-sm text-gray-500">
                Fetch prices for an item in a location. Normalized weights: 1kg, 5kg, 10kg, 25kg, 50kg.
              </p>
              <div className="mt-4 rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <pre className="overflow-x-auto whitespace-pre-wrap">{CODE_SNIPPET}</pre>
                <Button variant="ghost" size="icon-sm" className="mt-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
