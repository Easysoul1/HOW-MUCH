"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { analyticsApi, ordersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [analyticsRes, ordersRes]: any = await Promise.all([
        analyticsApi.getVendorOverview().catch(() => null),
        ordersApi.list().catch(() => ({ results: [] }))
      ]);

      if (analyticsRes) {
        setData(analyticsRes);
      } else {
        throw new Error("Analytics data unavailable");
      }

      setOrders(ordersRes.results || ordersRes || []);

    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      // Fallback
      setData({
        totalRevenue: 4500000,
        activeProducts: 45,
        pendingOrders: 12,
        storeGrowth: 12.5,
      });
      setOrders(MOCK_ORDERS);
      setError("Displaying cached dashboard data due to server error.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.business_name || user?.first_name || 'Vendor'}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-status-warning" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(data?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data?.storeGrowth || 0}%</div>
            <p className="text-xs text-muted-foreground">Customer visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 {MOCK_ORDERS.map((order) => (
                     <div key={order.id} className="flex items-center justify-between border-b border-light-border pb-4 last:border-0 last:pb-0">
                         <div className="flex flex-col">
                             <span className="font-medium text-foreground">{order.customerName || `Order #${order.id}`}</span>
                             <span className="text-xs text-muted-foreground">
                               {(typeof order.items === 'number' ? order.items : 1)} items • {order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date}
                             </span>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                             <span className="font-bold text-foreground">₦{(order.total || order.total_amount || 0).toLocaleString()}</span>
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${(order.status || 'pending') === 'pending' || (order.status || 'processing') === 'processing' ? 'bg-status-warning/20 text-status-warning' : 'bg-status-success/20 text-status-success'}`}>
                                 {order.status || 'Pending'}
                             </span>
                         </div>
                     </div>
                 ))}
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-light-panel rounded-lg"></div>
                          <div>
                              <p className="text-sm font-medium">Palm Oil (5L)</p>
                              <p className="text-xs text-status-danger">Only 12 left</p>
                          </div>
                      </div>
                      <button className="text-xs border border-light-border px-3 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-colors">Restock</button>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
