"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogPostPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Blog
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold md:text-3xl">
          Market report #{id}
        </h1>
        <p className="mt-2 text-muted-foreground">Sample date and excerpt.</p>
        <div className="prose prose-slate dark:prose-invert mt-8">
          <p>
            This is a placeholder for the full blog post or market report. In production,
            content would be loaded by ID from a CMS or API. Price analysis, seasonal trends,
            and economic commentary would appear here.
          </p>
        </div>
      </motion.article>
    </div>
  );
}
