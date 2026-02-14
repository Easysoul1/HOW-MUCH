"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiveSearchBar } from "@/components/search/live-search-bar";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ScrollFade } from "@/components/motion/scroll-fade";
import { HoverLift } from "@/components/motion/hover-lift";
import {
  BarChart3,
  Zap,
  MapPin,
  ArrowRight,
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

const MARKETS = [
  { name: "Mile 12 Market", city: "Lagos", image: IMAGES.marketMile12, description: "Lagos’ largest fresh food market" },
  { name: "Bodija Market", city: "Ibadan", image: IMAGES.marketBodija, description: "Oyo’s central commodity hub" },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Search", description: "Enter any grocery item and location. We normalize weights (5kg, 10kg, 25kg) for fair comparison.", icon: BarChart3 },
  { step: 2, title: "Compare", description: "See real prices from verified vendors. Distance, market area, and mini trend graphs per result.", icon: MapPin },
  { step: 3, title: "Decide", description: "Use suggestive buy engine and logistics preview. Get the real total cost before you buy.", icon: Zap },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero with subtle market background overlay */}
      <section className="relative min-h-[85vh] overflow-hidden border-b border-light-border dark:border-dark-border">
        <div className="absolute inset-0">
          <OptimizedImage
            src={IMAGES.heroMarket}
            alt="Nigerian market"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        </div>
        <div className="container relative z-10 flex min-h-[85vh] flex-col justify-center px-4 md:px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary dark:text-accent md:text-5xl lg:text-6xl">
              {SITE.name}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground md:text-2xl">
              {SITE.tagline}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Nigeria&apos;s grocery intelligence engine. Not a marketplace — clarity on real prices, anywhere.
            </p>
            <div className="relative mx-auto mt-12 flex justify-center">
              <LiveSearchBar variant="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live price ticker */}
      <section className="border-b border-light-border bg-light-panel/80 py-4 dark:border-dark-border dark:bg-dark-panel/80">
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((row, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{row.item}</span>
                <span>{row.location}</span>
                <span className="font-display font-semibold text-accent">{formatPrice(row.price)}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust metrics */}
      <section className="section-padding-sm border-b border-light-border dark:border-dark-border">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {TRUST_METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i }}
                >
                  <p className="font-display text-3xl font-bold text-primary dark:text-accent md:text-4xl">
                    {m.value}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Markets: Mile 12, Bodija — real-world context */}
      <section className="section-padding border-b border-light-border bg-light-panel/50 dark:border-dark-border dark:bg-dark-panel/30">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Real prices from real markets
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                We track prices at Mile 12 (Lagos), Bodija (Ibadan), Wuse (Abuja), and dozens more. See where your staples actually cost less.
              </p>
            </ScrollFade>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {MARKETS.map((market, i) => (
                <ScrollFade key={market.name} delay={i * 0.1}>
                  <HoverLift>
                    <Link
                      href="/search?location=Lagos"
                      className="group block overflow-hidden rounded-2xl border border-light-border bg-white shadow-depth-2 transition-shadow hover:shadow-depth-3 dark:border-dark-border dark:bg-dark-panel"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <OptimizedImage
                          src={market.image}
                          alt={market.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <p className="font-display text-lg font-semibold">{market.name}</p>
                          <p className="text-sm opacity-90">{market.description} · {market.city}</p>
                        </div>
                      </div>
                    </Link>
                  </HoverLift>
                </ScrollFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Image grid: grocery markets */}
      <section className="section-padding border-b border-light-border dark:border-dark-border">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                From the stalls to your screen
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Crowdsourced and verified data from markets across Nigeria. No guesswork — just the numbers.
              </p>
            </ScrollFade>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[IMAGES.grid1, IMAGES.grid2, IMAGES.grid3, IMAGES.grid4].map((src, i) => (
                <ScrollFade key={i} delay={i * 0.06}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-depth-1">
                    <OptimizedImage
                      src={src}
                      alt="Grocery market"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </ScrollFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Try it now / CTA */}
      <section className="section-padding border-b border-light-border dark:border-dark-border">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <ScrollFade>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Try it now
              </h2>
              <p className="mt-3 text-muted-foreground">
                Search any staple. See prices across Lagos, Abuja, Ibadan and more.
              </p>
            </ScrollFade>
            <div className="mt-10 flex justify-center">
              <LiveSearchBar variant="inline" />
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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

      {/* How it works — cards with hover lift */}
      <section className="section-padding border-b border-light-border bg-light-panel/50 dark:border-dark-border dark:bg-dark-panel/30">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <ScrollFade className="text-center">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                From search to decision — we give you the data to buy with confidence.
              </p>
            </ScrollFade>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((item, i) => (
                <ScrollFade key={item.step} delay={0.1 * i}>
                  <HoverLift y={-6}>
                    <div className="rounded-2xl border border-light-border bg-white p-8 shadow-depth-1 transition-shadow hover:shadow-depth-2 dark:border-dark-border dark:bg-dark-panel">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </HoverLift>
                </ScrollFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics preview — data dashboard mock */}
      <section className="section-padding border-b border-light-border dark:border-dark-border">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Price intelligence, not noise
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Interactive charts, inflation indicators, and exportable data. Built for anyone who cares where their naira goes.
              </p>
            </ScrollFade>
            <ScrollFade delay={0.15}>
              <div className="relative mt-12 overflow-hidden rounded-2xl border border-light-border bg-white shadow-depth-3 dark:border-dark-border dark:bg-dark-panel">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-accent/5" />
                <div className="relative aspect-[2/1] md:aspect-[21/9]">
                  <OptimizedImage
                    src={IMAGES.analyticsDashboard}
                    alt="Analytics dashboard preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 1024px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
              </div>
            </ScrollFade>
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/price-history">Explore price history</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API teaser */}
      <section className="section-padding border-b border-light-border bg-light-panel/50 dark:border-dark-border dark:bg-dark-panel/30">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <ScrollFade>
              <div className="flex flex-col items-center rounded-2xl border border-light-border bg-white p-10 text-center shadow-depth-1 dark:border-dark-border dark:bg-dark-panel md:p-14">
                <Code2 className="h-14 w-14 text-accent" />
                <h2 className="mt-6 font-display text-2xl font-semibold">
                  Build on HOW MUCH
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Integrate price intelligence into your app. API documentation, keys, and usage analytics for developers.
                </p>
                <Button className="mt-8" size="lg" asChild>
                  <Link href="/integrator/docs">API Documentation</Link>
                </Button>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <ScrollFade>
              <h2 className="font-display text-2xl font-semibold">
                Know the real price. Anywhere in Nigeria.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Join thousands who make informed grocery decisions every day.
              </p>
            </ScrollFade>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
