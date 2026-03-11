"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SurveyLandingPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Crowdsourcing</h1>
        <p className="mt-1 text-muted-foreground">
          Submit prices from your market and earn rewards. Help keep HOW MUCH accurate.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-4">
        <Button size="lg" asChild>
          <Link href="/survey/submit">Submit a price</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/survey/dashboard">My submissions</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/survey/rewards">Reward tracker</Link>
        </Button>
      </div>
    </div>
  );
}
