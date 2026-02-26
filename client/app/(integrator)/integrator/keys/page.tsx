"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Copy } from "lucide-react";

const MOCK_KEYS = [
  { id: "1", name: "Production", key: "hm_live_••••••••••••••••", lastUsed: "2h ago" },
];

export default function APIKeysPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">API keys</h1>
            <p className="mt-1 text-gray-500">
              Create and manage keys. Keep them secret.
            </p>
          </div>
          <Button><Plus className="mr-2 h-4 w-4" />Create key</Button>
        </div>
      </motion.div>

      <ul className="space-y-4">
        {MOCK_KEYS.map((k) => (
          <Card key={k.id} className="border-gray-200 bg-white">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display font-semibold">{k.name}</p>
                <p className="font-mono text-sm text-gray-500">{k.key}</p>
                <p className="mt-1 text-xs text-gray-500">Last used: {k.lastUsed}</p>
              </div>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
}
