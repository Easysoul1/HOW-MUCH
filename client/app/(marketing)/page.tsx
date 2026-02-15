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
      {/* Hero: layered depth + gradient overlay */}
      <section className="relative min-h-[85vh] overflow-hidden section-divider">
        <div className="absolute inset-0">
          <OptimizedImage
            src={IMAGES.heroMarket}
            alt="Nigerian market"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-100 dark:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-hero dark:bg-gradient-hero-dark opacity-80 dark:opacity-100" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,208,132,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,208,132,0.08),transparent)]" />
        </div>
        <div className="container relative z-10 flex min-h-[85vh] flex-col justify-center">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Subtle backdrop for text readability - mainly for dark mode or if image shows through */}
            <div className="absolute inset-0 -z-10 hidden dark:block bg-radial-gradient from-black/40 to-transparent blur-2xl" />
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl dark:text-display-xl dark:md:text-4xl dark:lg:text-5xl dark:xl:text-display-xl text-black dark:text-white drop-shadow-sm dark:drop-shadow-lg font-bold tracking-tight">
              {SITE.name}
            </h1>
            <p className="mt-6 text-2xl md:text-3xl dark:text-body-lg dark:md:text-display-sm text-black/90 dark:text-white/90 font-medium dark:font-normal drop-shadow-sm dark:drop-shadow-md">
              {SITE.tagline}
            </p>
            <p className="mt-4 text-xl md:text-2xl dark:text-body-lg text-black/80 dark:text-white/80 drop-shadow-sm dark:drop-shadow-md max-w-2xl mx-auto">
              Nigeria&apos;s grocery intelligence engine. Not a marketplace — clarity on real prices, anywhere.
            </p>
            <div className="relative mx-auto mt-12 flex justify-center">
              <LiveSearchBar variant="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live price ticker */}
      <section className="section-divider bg-light-panel/70 py-4 dark:bg-dark-panel/50">
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((row, i) => (
              <span key={i} className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <span className="font-medium text-foreground">{row.item}</span>
                <span>{row.location}</span>
                <span className="font-numeric font-semibold text-accent">{formatPrice(row.price)}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust metrics */}
      <section className="section-padding-sm section-divider">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {TRUST_METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: 0.05 * i }}
                >
                  <p className="font-numeric text-display-md font-bold text-primary dark:text-accent md:text-display-lg">
                    {m.value}
                  </p>
                  <p className="mt-1.5 text-caption text-muted-foreground">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Markets: Mile 12, Bodija — real-world context */}
      <section className="section-padding section-divider bg-light-panel/40 dark:bg-dark-panel/25">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="text-display-md md:text-display-lg">
                Real prices from real markets
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
                We track prices at Mile 12 (Lagos), Bodija (Ibadan), Wuse (Abuja), and dozens more. See where your staples actually cost less.
              </p>
            </ScrollFade>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {MARKETS.map((market, i) => (
                <ScrollFade key={market.name} delay={i * 0.08}>
                  <HoverLift>
                    <Link
                      href="/search?location=Lagos"
                      className="group block overflow-hidden rounded-xl border border-light-border bg-white shadow-depth-2 shadow-inner-soft transition-all duration-normal hover:border-light-border/80 hover:shadow-depth-3 dark:border-dark-border dark:bg-dark-panel dark:shadow-inner-soft"
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
      <section className="section-padding section-divider">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="text-display-md md:text-display-lg">
                From the stalls to your screen
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
                Crowdsourced and verified data from markets across Nigeria. No guesswork — just the numbers.
              </p>
            </ScrollFade>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[IMAGES.grid1, IMAGES.grid2, IMAGES.grid3, IMAGES.grid4].map((src, i) => (
                <ScrollFade key={i} delay={i * 0.05}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-depth-1 shadow-inner-soft">
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
      <section className="section-padding section-divider">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <ScrollFade>
              <h2 className="text-display-md md:text-display-lg">
                Try it now
              </h2>
              <p className="mt-3 text-body text-muted-foreground">
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
      <section className="section-padding section-divider bg-light-panel/40 dark:bg-dark-panel/25">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <ScrollFade className="text-center">
              <h2 className="text-display-md md:text-display-lg">
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
                From search to decision — we give you the data to buy with confidence.
              </p>
            </ScrollFade>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((item, i) => (
                <ScrollFade key={item.step} delay={0.08 * i}>
                  <HoverLift y={-4}>
                    <div className="rounded-xl border border-light-border bg-white p-6 shadow-depth-1 shadow-inner-soft transition-all duration-normal hover:border-light-border/80 hover:shadow-depth-2 dark:border-dark-border dark:bg-dark-panel dark:shadow-inner-soft">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-display-sm">{item.title}</h3>
                      <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">
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
      <section className="section-padding section-divider">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <ScrollFade className="text-center">
              <h2 className="text-display-md md:text-display-lg">
                Price intelligence, not noise
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
                Interactive charts, inflation indicators, and exportable data. Built for anyone who cares where their naira goes.
              </p>
            </ScrollFade>
            <ScrollFade delay={0.1}>
              <div className="relative mt-12 overflow-hidden rounded-xl border border-light-border bg-white shadow-depth-3 shadow-inner-soft dark:border-dark-border dark:bg-dark-panel dark:shadow-inner-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent dark:from-accent/[0.04]" />
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
      <section className="section-padding section-divider bg-light-panel/40 dark:bg-dark-panel/25">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <ScrollFade>
              <div className="flex flex-col items-center rounded-xl border border-light-border bg-white p-10 text-center shadow-depth-1 shadow-inner-soft dark:border-dark-border dark:bg-dark-panel dark:shadow-inner-soft md:p-14">
                <Code2 className="h-12 w-12 text-accent" />
                <h2 className="mt-6 text-display-md md:text-display-lg">
                  Build on HOW MUCH
                </h2>
                <p className="mt-3 text-body text-muted-foreground">
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
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <ScrollFade>
              <h2 className="text-display-md md:text-display-lg">
                Know the real price. Anywhere in Nigeria.
              </h2>
              <p className="mt-3 text-body text-muted-foreground">
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
