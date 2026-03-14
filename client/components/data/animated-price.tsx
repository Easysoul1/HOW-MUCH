"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AnimatedPriceProps {
  value: number;
  className?: string;
}

export function AnimatedPrice({ value, className }: AnimatedPriceProps) {
  const [display, setDisplay] = useState(value);
  const spring = useSpring(value, { stiffness: 80, damping: 30 });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return (
    <motion.span className={cn("font-display tabular-nums", className)}>
      {formatPrice(display)}
    </motion.span>
  );
}
