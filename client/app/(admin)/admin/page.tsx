"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Store, FileCheck, AlertTriangle, Image } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Verification queue, survey validation, fraud monitoring.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-dark-border bg-dark-panel" asChild>
          <Link href="/admin/vendor-verification">
            <CardContent className="p-5">
              <Store className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Vendor queue</p>
              <p className="font-display text-2xl font-bold">12</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="border-dark-border bg-dark-panel" asChild>
          <Link href="/admin/survey-validation">
            <CardContent className="p-5">
              <FileCheck className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Survey pending</p>
              <p className="font-display text-2xl font-bold">28</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="border-dark-border bg-dark-panel" asChild>
          <Link href="/admin/fraud">
            <CardContent className="p-5">
              <AlertTriangle className="h-8 w-8 text-amber-highlight" />
              <p className="mt-2 text-sm text-muted-foreground">Fraud alerts</p>
              <p className="font-display text-2xl font-bold">3</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="border-dark-border bg-dark-panel" asChild>
          <Link href="/admin/social">
            <CardContent className="p-5">
              <Image className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Social generator</p>
              <p className="font-display text-2xl font-bold">—</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
