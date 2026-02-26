"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";

// Mock data for the initial UI
const MOCK_PRICES = [
  { id: 1, product: "Milo (500g)", price: 2500, market: "Oyingbo Market", status: "APPROVED", date: "Oct 24, 2023" },
  { id: 2, product: "Dangote Sugar (1kg)", price: 1200, market: "Tejuosho Market", status: "PENDING", date: "Oct 25, 2023" },
  { id: 3, product: "Peak Milk (380g)", price: 1500, market: "Mile 12 Market", status: "REJECTED", date: "Oct 21, 2023" },
  { id: 4, product: "Golden Penny Spaghetti", price: 600, market: "Oyingbo Market", status: "APPROVED", date: "Oct 20, 2023" },
];

export default function CrowdSourcerDashboardPage() {
  const [prices] = useState(MOCK_PRICES);
  
  // Basic stats
  const approvedCount = prices.filter(p => p.status === 'APPROVED').length;
  const pendingCount = prices.filter(p => p.status === 'PENDING').length;
  const rejectedCount = prices.filter(p => p.status === 'REJECTED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your price submissions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-success">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Live on the platform</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin action</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-status-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-danger">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Verify prices clearly</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-dark-panel border-dark-border col-span-4">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {prices.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-dark-border pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">{item.product}</span>
                            <span className="text-xs text-muted-foreground">{item.market} • {item.date}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-foreground">₦{item.price.toLocaleString()}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                              ${item.status === 'PENDING' ? 'bg-status-warning/20 text-status-warning' : 
                                item.status === 'APPROVED' ? 'bg-status-success/20 text-status-success' : 
                                'bg-status-danger/20 text-status-danger'}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
