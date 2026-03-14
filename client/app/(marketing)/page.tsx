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
            className="object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,208,132,0.06),transparent)]" />
        </div>
        <div className="container relative z-10 flex min-h-[85vh] flex-col justify-center px-4 md:px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Subtle backdrop for text readability - mainly for dark mode or if image shows through */}
            <div className="absolute inset-0 -z-10 hidden bg-radial-gradient from-black/40 to-transparent blur-2xl" />
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-black drop-shadow-sm font-bold tracking-tight break-words">
              {SITE.name}
            </h1>
            <p className="mt-6 text-xl sm:text-2xl md:text-3xl text-black/90 font-medium drop-shadow-sm px-2">
              {SITE.tagline}
            </p>
            <p className="mt-4 text-lg sm:text-xl md:text-2xl text-black/80 drop-shadow-sm max-w-2xl mx-auto px-2">
              Nigeria&apos;s grocery intelligence engine. Not a marketplace — clarity on real prices, anywhere.
            </p>
            <div className="relative mx-auto mt-12 flex justify-center w-full px-4 sm:px-0">
              <LiveSearchBar variant="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live price ticker */}
      <section className="section-divider bg-light-panel/70 py-4">
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: "-50%" }}
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
                  <p className="font-numeric text-display-md font-bold text-primary md:text-display-lg">
                    {m.value}
                  </p>
                  <p className="mt-1.5 text-caption text-muted-foreground">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Data Access CTA */}
      <section className="section-padding section-divider bg-gradient-to-br from-green-50 via-white to-green-50/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <ScrollFade>
              <div className="rounded-2xl border-2 border-green-200 bg-white p-8 shadow-depth-3 shadow-inner-soft md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg">
                    <Code2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-display-lg md:text-display-xl font-bold text-gray-900">
                    Power your business with Nigerian price data
                  </h2>
                  <p className="mt-4 max-w-2xl text-body-lg text-gray-600">
                    Access real-time grocery prices across Nigeria through our enterprise API. Perfect for fintech apps, economic research, supply chain analytics, and business intelligence platforms.
                  </p>
                  <div className="mt-8 grid gap-4 text-left w-full max-w-2xl md:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">2M+ data points</h3>
                        <p className="text-body-sm text-gray-600">Historical & real-time pricing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">12 states covered</h3>
                        <p className="text-body-sm text-gray-600">Major markets nationwide</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">REST API</h3>
                        <p className="text-body-sm text-gray-600">Simple JSON integration</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Developer-friendly</h3>
                        <p className="text-body-sm text-gray-600">Full docs & support</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                      <Link href="/integrator/docs">
                        View API Documentation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/contact">Contact Sales</Link>
                    </Button>
                  </div>
                  <p className="mt-6 text-body-sm text-gray-500">
                    Trusted by fintech, research institutions, and supply chain platforms
                  </p>
                </div>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* Markets: Mile 12, Bodija — real-world context */}
      <section className="section-padding section-divider bg-light-panel/40">
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
                      className="group block overflow-hidden rounded-xl border border-light-border bg-white shadow-depth-2 shadow-inner-soft transition-all duration-normal hover:border-light-border/80 hover:shadow-depth-3"
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
      <section className="section-padding section-divider bg-light-panel/40">
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
                    <div className="rounded-xl border border-light-border bg-white p-6 shadow-depth-1 shadow-inner-soft transition-all duration-normal hover:border-light-border/80 hover:shadow-depth-2">
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
              <div className="relative mt-12 overflow-hidden rounded-xl border border-light-border bg-white shadow-depth-3 shadow-inner-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent" />
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
      <section className="section-padding section-divider bg-light-panel/40">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <ScrollFade>
              <div className="flex flex-col items-center rounded-xl border border-light-border bg-white p-10 text-center shadow-depth-1 shadow-inner-soft md:p-14">
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
