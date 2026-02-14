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
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
