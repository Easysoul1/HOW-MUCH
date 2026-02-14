"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiveSearchBar } from "@/components/search/live-search-bar";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import {
  BarChart3,
  Shield,
  Zap,
  MapPin,
  ArrowRight,
  TrendingUp,
  Code2,
} from "lucide-react";

const TICKER_ITEMS = [
  { item: "Rice 5kg", location: "Lagos", price: 4850 },
  { item: "Beans 10kg", location: "Abuja", price: 7200 },
  { item: "Garri 2kg", location: "Ibadan", price: 1200 },
  { item: "Rice 5kg", location: "Abuja", price: 5100 },
  { item: "Tomatoes", location: "Lagos", price: 3500 },
  { item: "Groundnut oil 1L", location: "Ibadan", price: 2800 },
];

const TRUST_METRICS = [
  { value: "2M+", label: "Price points" },
  { value: "12", label: "States covered" },
  { value: "50k+", label: "Vendors" },
  { value: "99%", label: "Data accuracy" },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Search",
    description: "Enter any grocery item and location. We normalize weights (5kg, 10kg, 25kg) for fair comparison.",
    icon: BarChart3,
  },
  {
    step: 2,
    title: "Compare",
    description: "See real prices from verified vendors. Distance, market area, and mini trend graphs per result.",
    icon: MapPin,
  },
  {
    step: 3,
    title: "Decide",
    description: "Use suggestive buy engine and logistics preview. Get the real total cost before you buy.",
    icon: Zap,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-light-border dark:border-dark-border">
        <div className="container relative z-10 px-4 py-16 md:px-6 md:py-24">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary dark:text-accent md:text-5xl lg:text-6xl">
              {SITE.name}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
              {SITE.tagline}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nigeria&apos;s grocery intelligence engine. Not a marketplace — clarity on real prices, anywhere.
            </p>
            <div className="relative mx-auto mt-10 flex justify-center">
              <LiveSearchBar variant="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live price ticker */}
      <section className="border-b border-light-border bg-light-panel dark:border-dark-border dark:bg-dark-panel">
        <div className="flex overflow-hidden py-3">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((row, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">{row.item}</span>
                <span>{row.location}</span>
                <span className="font-display font-semibold text-accent">
                  {formatPrice(row.price)}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust metrics */}
      <section className="border-b border-light-border py-12 dark:border-dark-border md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {TRUST_METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <p className="font-display text-3xl font-bold text-primary dark:text-accent md:text-4xl">
                  {m.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search demo / CTA */}
      <section className="border-b border-light-border py-12 dark:border-dark-border md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Try it now
            </h2>
            <p className="mt-2 text-muted-foreground">
              Search any staple. See prices across Lagos, Abuja, Ibadan and more.
            </p>
            <div className="mt-6 flex justify-center">
              <LiveSearchBar variant="inline" />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/search">
                  View search results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/suggestive-buy">Suggestive buy engine</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-light-border py-12 dark:border-dark-border md:py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-center font-display text-2xl font-semibold md:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            From search to decision — we give you the data to buy with confidence.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                className="rounded-xl border border-light-border bg-white p-6 dark:border-dark-border dark:bg-dark-panel"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API teaser */}
      <section className="border-b border-light-border py-12 dark:border-dark-border md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-light-border bg-light-panel p-8 text-center dark:border-dark-border dark:bg-dark-panel md:p-12">
            <Code2 className="h-12 w-12 text-accent" />
            <h2 className="mt-4 font-display text-2xl font-semibold">
              Build on HOW MUCH
            </h2>
            <p className="mt-2 text-muted-foreground">
              Integrate price intelligence into your app. API documentation, keys, and usage analytics for developers.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/integrator/docs">API Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-semibold">
              Know the real price. Anywhere in Nigeria.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Join thousands who make informed grocery decisions every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
