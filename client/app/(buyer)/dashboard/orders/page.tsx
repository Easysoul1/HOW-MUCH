"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { Package, Truck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: any = await ordersApi.list();
      setOrders(data.results || data);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setOrders(MOCK_ORDERS);
      setError("Displaying standard mock orders due to error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-black dark:text-white font-display font-bold">My Orders</h1>
        <Button variant="outline" asChild>
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-status-warning" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You have no orders yet.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-light-panel dark:bg-dark-elevated border-b border-light-border dark:border-dark-border py-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase">Order Placed</span>
                      <span className="font-medium text-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase">Total</span>
                      <span className="font-medium text-foreground">₦{(order.total_amount || order.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col hidden sm:flex">
                      <span className="text-xs uppercase">Order ID</span>
                      <span className="font-medium text-foreground">#{order.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                       <Button size="sm" variant="outline" className="h-8 text-xs">View Invoice</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-light-panel dark:bg-dark-elevated rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-foreground">{order.items?.length || order.items || 1} Items</h3>
                      <p className="text-sm text-muted-foreground mb-2">Expected Delivery: {new Date(new Date().setDate(new Date().getDate() + 3)).toLocaleDateString()}</p>
                      <div className={`flex items-center gap-2 text-sm font-medium
                        ${(order.status || 'pending') === 'delivered' ? 'text-status-success' : 'text-blue-500'}
                      `}>
                          <Truck className="w-4 h-4" />
                          <span className="capitalize">{order.status || 'Processing'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                      <Button className="flex-1 md:flex-none" disabled={(order.status || 'pending') === 'delivered'}>Track Package</Button>
                      <Button variant="outline" className="flex-1 md:flex-none" asChild>
                        <Link href="/shop">Buy Again</Link>
                      </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
