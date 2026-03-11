"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  y?: number;
}

export function ScrollFade({
  children,
  className,
  delay = 0,
  once = true,
  y = 16,
}: ScrollFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-32px" }}
      transition={{ duration: 0.28, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
