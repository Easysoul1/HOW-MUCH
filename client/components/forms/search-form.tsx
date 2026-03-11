"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Search } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("5kg");
  const [location, setLocation] = useState("Lagos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams({
      q: query.trim(),
      weight,
      location,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Input
        type="search"
        placeholder="e.g. Rice, Beans..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />
      <Select value={weight} onValueChange={setWeight}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WEIGHT_OPTIONS.rice.map((w) => (
            <SelectItem key={w} value={w}>{w}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCATIONS.map((loc) => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
