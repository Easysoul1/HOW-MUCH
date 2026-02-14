"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_HEATMAP = [
  { location: "Lagos", level: 2, count: 5 },
  { location: "Abuja", level: 1, count: 2 },
  { location: "Ibadan", level: 3, count: 8 },
];

export default function FraudMonitoringPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Fraud monitoring heatmap</h1>
        <p className="mt-1 text-muted-foreground">
          Flagged submissions and outlier activity by location.
        </p>
      </motion.div>

      <Card className="border-dark-border bg-dark-panel">
        <CardHeader>
          <CardTitle>Risk by location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_HEATMAP.map((row) => (
              <div key={row.location} className="flex items-center justify-between rounded-lg border border-dark-border p-3">
                <span className="font-medium">{row.location}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{row.count} flags</span>
                  <Badge variant={row.level >= 3 ? "destructive" : row.level >= 2 ? "warning" : "secondary"}>
                    Level {row.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
