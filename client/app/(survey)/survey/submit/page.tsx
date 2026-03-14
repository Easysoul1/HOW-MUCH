"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LOCATIONS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import { MapPin, Upload, AlertTriangle } from "lucide-react";

export default function SurveySubmissionPage() {
  const [location, setLocation] = useState("Lagos");
  const [market, setMarket] = useState("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [fraudIndicator, setFraudIndicator] = useState<"low" | "medium" | "high">("low");
  const rewardPreview = 150;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative mb-8 overflow-hidden rounded-xl border border-gray-200">
          <div className="relative aspect-[21/9] min-h-[140px] bg-gray-50">
            <OptimizedImage
              src={IMAGES.marketSurvey}
              alt="Market survey"
              fill
              sizes="100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-panel to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h1 className="font-display text-xl font-bold">Survey submission</h1>
              <p className="text-sm text-gray-500">
                Auto-detect location, add price, market. We show fraud detection and reward preview.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <Card className="border-gray-200 bg-white shadow-depth-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <p className="text-sm text-gray-500">
            Auto-detected. You can change it.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Price entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Item name</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Rice 5kg" className="mt-1" />
          </div>
          <div>
            <Label>Market</Label>
            <Input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="e.g. Oyingbo Market" className="mt-1" />
          </div>
          <div>
            <Label>Price (NGN)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4850" className="mt-1 max-w-[200px]" />
          </div>
          <div>
            <Label>Video / photo (optional)</Label>
            <Button variant="outline" className="mt-2 gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-highlight" />
            <span>Fraud detection</span>
          </div>
          <Badge variant={fraudIndicator === "low" ? "success" : "warning"}>
            {fraudIndicator} risk
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-accent-muted/20">
        <CardContent className="flex items-center justify-between p-5">
          <p className="font-medium">Reward preview</p>
          <p className="font-display text-xl font-bold text-accent">₦{rewardPreview}</p>
        </CardContent>
      </Card>

      <Button size="lg">Submit</Button>
    </div>
  );
}
