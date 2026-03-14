"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, format = (n) => n.toString(), className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const spring = useSpring(value, { stiffness: 75, damping: 25 });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [spring]);

  return (
    <motion.span className={className} initial={false} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(Math.round(display))}
    </motion.span>
  );
}
