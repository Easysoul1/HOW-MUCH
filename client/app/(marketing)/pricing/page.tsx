"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Code2 } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Search and compare. Basic price history.",
    features: ["Unlimited search", "7-day price history", "Vendor directory"],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "5,000",
    period: "/month",
    description: "For serious savers and small teams.",
    features: ["Everything in Free", "90-day history", "CSV export", "Saved items & searches", "Suggestive buy engine"],
    cta: "Start trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "API",
    price: "Custom",
    description: "Integrate price intelligence into your app.",
    features: ["API access", "Usage analytics", "Dedicated support", "SLA"],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-center font-display text-2xl font-bold md:text-3xl">
          Pricing & API
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          Subscription tiers and API benefits. Integrators: get in touch for API access.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-accent shadow-glow" : ""}
            >
              <CardHeader>
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {plan.price}
                  {plan.period && (
                    <span className="text-lg font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "accent" : "default"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-xl flex-col items-center rounded-2xl border border-light-border bg-light-panel p-8 text-center">
          <Code2 className="h-12 w-12 text-accent" />
          <h2 className="mt-4 font-display text-xl font-semibold">API for integrators</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build price comparison, logistics, or market tools on top of HOW MUCH. Documentation, keys, and usage analytics in the integrator dashboard.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/integrator/docs">API Documentation</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
