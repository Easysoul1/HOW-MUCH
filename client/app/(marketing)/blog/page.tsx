"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { HoverLift } from "@/components/motion/hover-lift";
import { IMAGES } from "@/lib/images";
import { ArrowRight } from "lucide-react";

const MOCK_POSTS = [
  { id: "1", title: "Lagos staple basket: May 2024", excerpt: "Rice, beans, and garri trends across major markets.", date: "May 15, 2024", image: IMAGES.blogFeatured1, category: "Markets" },
  { id: "2", title: "Inflation and food prices: what the data shows", excerpt: "YoY comparison and seasonal patterns.", date: "May 1, 2024", image: IMAGES.blogFeatured2, category: "Analysis" },
  { id: "3", title: "Abuja vs Lagos: price differentials", excerpt: "Market comparison and logistics impact.", date: "Apr 20, 2024", image: IMAGES.blogFeatured3, category: "Comparison" },
];

export default function BlogPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Blog & market reports
        </h1>
        <p className="mt-2 text-muted-foreground">
          Market insights, price analysis, and economic commentary.
        </p>

        <ul className="mt-12 space-y-6">
          {MOCK_POSTS.map((post, i) => (
            <motion.li
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <HoverLift y={-4}>
                <Card className="overflow-hidden border border-light-border shadow-depth-1 transition-shadow hover:shadow-depth-2" asChild>
                  <Link href={`/blog/${post.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-stretch">
                      <div className="relative aspect-[16/10] w-full shrink-0 sm:w-80">
                        <OptimizedImage
                          src={post.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                      <CardContent className="flex flex-1 flex-wrap items-center justify-between gap-4 p-6">
                        <div>
                          <h2 className="font-display font-semibold">{post.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{post.date}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </div>
                  </Link>
                </Card>
              </HoverLift>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
