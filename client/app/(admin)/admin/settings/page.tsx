"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure global system parameters and limits.</p>
        </div>
        <Button className="bg-primary text-gray-900 hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Platform Configuration</CardTitle>
            <CardDescription className="text-gray-500">Manage global fees and revenue cut percentages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform-fee" className="text-gray-900">Vendor Platform Fee (%)</Label>
                <Input id="platform-fee" defaultValue="3.5" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal-limit" className="text-gray-900">Minimum Withdrawal Limit (₦)</Label>
                <Input id="withdrawal-limit" defaultValue="5000" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary" />
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">Automated Systems</h4>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <h5 className="text-gray-900 font-medium text-sm">Auto-Approve Verified Vendors</h5>
                  <p className="text-xs text-gray-500 mt-1">Vendors passing KYC will be instantly approved</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <h5 className="text-gray-900 font-medium text-sm">AI Price Anomaly Detection</h5>
                  <p className="text-xs text-gray-500 mt-1">Automatically flag products priced suspiciously lower than market average</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Contact & Support Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-email" className="text-gray-900">Primary Support Email</Label>
                <Input id="support-email" defaultValue="support@howmuch.ng" type="email" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-gray-900">Support Hotline</Label>
                <Input id="contact-phone" defaultValue="+234 800 123 4567" className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
