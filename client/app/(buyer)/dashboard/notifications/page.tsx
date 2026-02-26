"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const MOCK_NOTIFS = [
  { id: "1", title: "Price drop", body: "Rice 5kg in Lagos dropped below ₦4,900.", time: "2h ago" },
  { id: "2", title: "Order update", body: "Order ORD-002 confirmed by shopper.", time: "1d ago" },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-black">Notifications</h1>
        <p className="mt-1 text-black">
          Price alerts and order updates.
        </p>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_NOTIFS.map((n, i) => (
          <motion.li
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-gray-200 bg-white">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex gap-3">
                  <Bell className="h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Mark read</Button>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
