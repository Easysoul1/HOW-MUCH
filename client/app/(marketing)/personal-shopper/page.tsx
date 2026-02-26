"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ScrollFade } from "@/components/motion/scroll-fade";
import { HoverLift } from "@/components/motion/hover-lift";
import { IMAGES } from "@/lib/images";
import { Shield, ArrowRight } from "lucide-react";

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
        className="mx-auto max-w-4xl"
      >
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-light-border shadow-depth-2">
          <div className="relative aspect-[21/9] min-h-[200px] bg-light-panel">
            <OptimizedImage
              src={IMAGES.shopperMarket}
              alt="Shopper in market"
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Personal shopper
              </h1>
              <p className="mt-1 max-w-xl text-foreground/90">
                Get your groceries picked from verified vendors and delivered. How it works, trust & safety, then request.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 space-y-6">
          <h2 className="font-display text-xl font-semibold">How it works</h2>
          {STEPS.map((step, i) => (
            <ScrollFade key={step.title} delay={i * 0.08}>
              <HoverLift y={-4}>
                <Card className="shadow-depth-1 transition-shadow hover:shadow-depth-2">
                  <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
              </HoverLift>
            </ScrollFade>
          ))}
        </div>

        <ScrollFade delay={0.2}>
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-light-border">
            <div className="relative aspect-[2/1] bg-light-panel">
              <OptimizedImage src={IMAGES.delivery} alt="Delivery" fill sizes="(max-width: 768px) 100vw, 1024px" className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
          </div>
        </ScrollFade>

        <Card className="mt-10 border-accent/30 bg-accent-muted/20 shadow-depth-1">
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
