"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const MOCK_SEARCHES = [
  { id: "1", query: "Rice 5kg", location: "Lagos" },
  { id: "2", query: "Beans 10kg", location: "Abuja" },
];

export default function SavedSearchesPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Saved searches</h1>
        <p className="mt-1 text-muted-foreground">
          Re-run your frequent searches quickly.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_SEARCHES.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{s.query}</p>
                    <p className="text-sm text-muted-foreground">{s.location}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(s.query)}&location=${s.location}`}>
                    Run search
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
