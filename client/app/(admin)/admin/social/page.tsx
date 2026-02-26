"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/constants";
import { Image, Download, Sparkles } from "lucide-react";

export default function SocialMediaGeneratorPage() {
  const [headline, setHeadline] = useState(`Rice 5kg in Lagos: ₦4,850 avg this week`);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Social media auto generator</h1>
        <p className="mt-1 text-gray-500">
          Generate branded image post, auto headline, export image.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Auto generate headline
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex aspect-[1.91/1] flex-col justify-between rounded-xl border border-gray-200 bg-primary p-6 text-primary-foreground"
            >
              <div>
                <p className="font-display text-sm font-semibold text-accent">{SITE.name}</p>
                <p className="mt-2 text-lg font-medium">{headline}</p>
              </div>
              <p className="text-xs opacity-80">{SITE.tagline}</p>
            </div>
            <Button className="mt-4 w-full gap-2">
              <Download className="h-4 w-4" />
              Export image
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
