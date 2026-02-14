"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEIGHT_OPTIONS, LOCATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LiveSearchBarProps {
  variant?: "hero" | "inline" | "sticky";
  className?: string;
}

const POPULAR_ITEMS = ["Rice 5kg", "Beans 10kg", "Garri 2kg", "Groundnut oil 1L", "Tomatoes"];

export function LiveSearchBar({ variant = "hero", className }: LiveSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("5kg");
  const [location, setLocation] = useState("Lagos");
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      const params = new URLSearchParams({
        q: query.trim(),
        weight: weight,
        location: location,
      });
      router.push(`/search?${params.toString()}`);
    },
    [query, weight, location, router]
  );

  const isHero = variant === "hero";
  const isSticky = variant === "sticky";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center",
        isHero && "max-w-3xl rounded-2xl border-2 border-light-border bg-white p-2 shadow-lg dark:border-dark-border dark:bg-dark-panel",
        isSticky && "sticky top-16 z-40 rounded-xl border border-light-border bg-white/95 p-2 shadow dark:bg-dark-panel/95",
        className
      )}
      initial={isHero ? { opacity: 0, y: 20 } : false}
      animate={isHero ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="e.g. Rice, Beans, Garri..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-12 border-0 bg-transparent pl-10 pr-4 text-base focus-visible:ring-0 sm:h-11",
            isHero && "text-lg"
          )}
          aria-label="Search for grocery prices"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <Select value={weight} onValueChange={setWeight}>
          <SelectTrigger className={cn("w-full sm:w-[100px]", isHero && "h-12 border-0 bg-light-panel dark:bg-dark-elevated")}>
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent>
            {WEIGHT_OPTIONS.rice.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className={cn("w-full sm:w-[120px]", isHero && "h-12 border-0 bg-light-panel dark:bg-dark-elevated")}>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size={isHero ? "lg" : "default"} className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
      {isHero && focused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-light-border bg-white p-2 shadow-lg dark:border-dark-border dark:bg-dark-panel"
        >
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Popular</p>
          {POPULAR_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-light-panel dark:hover:bg-dark-elevated"
              onClick={() => {
                setQuery(item);
                setFocused(false);
              }}
            >
              {item}
            </button>
          ))}
        </motion.div>
      )}
    </motion.form>
  );
}
