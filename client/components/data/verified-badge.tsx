"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
  animated?: boolean;
}

export function VerifiedBadge({ size = "md", className, animated = true }: VerifiedBadgeProps) {
  const content = (
    <>
      {animated ? (
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </motion.span>
      ) : (
        <ShieldCheck className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      <span>Verified</span>
    </>
  );

  return (
    <Badge
      variant="verified"
      className={cn(
        "gap-1 font-medium shadow-[0_0_12px_-2px_rgba(0,208,132,0.4)]",
        size === "sm" && "px-1.5 py-0 text-[10px]",
        className
      )}
    >
      {content}
    </Badge>
  );
}
