"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const MOCK_POSTS = [
  { id: "1", title: "Lagos staple basket: May 2024", excerpt: "Rice, beans, and garri trends across major markets.", date: "May 15, 2024" },
  { id: "2", title: "Inflation and food prices: what the data shows", excerpt: "YoY comparison and seasonal patterns.", date: "May 1, 2024" },
  { id: "3", title: "Abuja vs Lagos: price differentials", excerpt: "Market comparison and logistics impact.", date: "Apr 20, 2024" },
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

        <ul className="mt-10 space-y-4">
          {MOCK_POSTS.map((post, i) => (
            <motion.li
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="transition-shadow hover:shadow-md" asChild>
                <Link href={`/blog/${post.id}`}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                      <h2 className="font-display font-semibold">{post.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{post.date}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Link>
              </Card>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
