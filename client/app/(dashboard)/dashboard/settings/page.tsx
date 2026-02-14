"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Account and preferences.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-dark-border bg-dark-panel">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="User" className="mt-1 max-w-md" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@example.com" className="mt-1 max-w-md" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-dark-border bg-dark-panel">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">
              Price alerts and order updates.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="price-alerts">Price drop alerts</Label>
              <Switch id="price-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-updates">Order updates</Label>
              <Switch id="order-updates" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
