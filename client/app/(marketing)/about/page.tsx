"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/constants";
import { Target, Database, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          About {SITE.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mission, data methodology, and verification process.
        </p>

        <Card className="mt-10">
          <CardContent className="flex gap-4 p-6">
            <Target className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">Mission</h2>
              <p className="mt-2 text-muted-foreground">
                We are Nigeria&apos;s grocery intelligence engine. We help people know the real price of food anywhere in the country — not to sell products, but to create transparency and empower informed decisions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="flex gap-4 p-6">
            <Database className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">Data methodology</h2>
              <p className="mt-2 text-muted-foreground">
                We aggregate prices from verified vendors, crowdsourced submissions, and partner integrations. We normalize weights (5kg, 10kg, 25kg, 50kg) and locations to ensure like-for-like comparison. All data is timestamped and validated.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="flex gap-4 p-6">
            <ShieldCheck className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">Verification process</h2>
              <p className="mt-2 text-muted-foreground">
                Vendors are verified through documentation, physical checks, and transaction history. Crowdsourced submissions are reviewed and cross-checked. Fraud indicators are applied to outliers. Our badge means we stand behind the data.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
