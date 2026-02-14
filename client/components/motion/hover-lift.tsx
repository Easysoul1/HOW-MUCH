"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
}

export function HoverLift({ children, className, y = -4 }: HoverLiftProps) {
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ y }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
