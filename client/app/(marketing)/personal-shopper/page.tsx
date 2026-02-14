"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, Clock, ArrowRight } from "lucide-react";

const STEPS = [
  { title: "Submit your list", description: "Add items, location, and delivery date via AI Shopping List." },
  { title: "We match a shopper", description: "Verified personal shoppers in your area accept the request." },
  { title: "Shop & deliver", description: "Shopper buys from trusted vendors and delivers to you." },
];

export default function PersonalShopperOverviewPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Personal shopper
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get your groceries picked from verified vendors and delivered. How it works, trust & safety, then request.
        </p>

        <div className="mt-10 space-y-6">
          <h2 className="font-display text-xl font-semibold">How it works</h2>
          {STEPS.map((step, i) => (
            <Card key={step.title}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground font-display font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-accent/30 bg-accent-muted/20 dark:bg-accent-muted/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-accent" />
              <div>
                <h3 className="font-semibold">Trust & safety</h3>
                <p className="text-sm text-muted-foreground">
                  All shoppers are verified. We use HOW MUCH price data so you pay fair prices.
                </p>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link href="/ai-shopping-list">
                Request personal shopper
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
