"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { crowdsourceApi } from "@/lib/api";

interface PriceItem {
  id: number;
  product_name: string;
  market_name: string;
  price: string | number;
  status: string;
  created_at: string;
}

export default function CrowdSourcerDashboardPage() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data: any = await crowdsourceApi.list();
        if (data && Array.isArray(data.results)) {
          setPrices(data.results);
        } else if (Array.isArray(data)) {
          setPrices(data);
        } else {
          setPrices([]);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);
  
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-light-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-light-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-success">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Live on the platform</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-light-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin action</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-light-border">
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

      <Card className="bg-white border-light-border col-span-4">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {prices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No prices submitted yet.</p>
                ) : (
                  prices.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-light-border pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                              <span className="font-medium text-foreground">{item.product_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.market_name} • {new Date(item.created_at).toLocaleDateString()}
                              </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-foreground">₦{Number(item.price).toLocaleString()}</span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                                ${item.status === 'PENDING' ? 'bg-status-warning/20 text-status-warning' : 
                                  item.status === 'APPROVED' ? 'bg-status-success/20 text-status-success' : 
                                  'bg-status-danger/20 text-status-danger'}`}>
                                  {item.status}
                              </span>
                          </div>
                      </div>
                  ))
                )}
            </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
