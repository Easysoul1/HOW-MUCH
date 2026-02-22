import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ANALYTICS_DATA, MOCK_ORDERS } from "@/lib/mock-data";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function VendorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Mama Nkechi Provisions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦4,500,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
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
                     <div key={order.id} className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-4 last:border-0 last:pb-0">
                         <div className="flex flex-col">
                             <span className="font-medium text-foreground">{order.customerName}</span>
                             <span className="text-xs text-muted-foreground">{order.items} items • {order.date}</span>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                             <span className="font-bold text-foreground">₦{order.total.toLocaleString()}</span>
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'processing' ? 'bg-status-warning/20 text-status-warning' : 'bg-status-success/20 text-status-success'}`}>
                                 {order.status}
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
                          <div className="w-10 h-10 bg-light-panel dark:bg-dark-elevated rounded-lg"></div>
                          <div>
                              <p className="text-sm font-medium">Palm Oil (5L)</p>
                              <p className="text-xs text-status-danger">Only 12 left</p>
                          </div>
                      </div>
                      <button className="text-xs border border-light-border dark:border-dark-border px-3 py-1 rounded hover:bg-primary hover:text-primary-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transition-colors">Restock</button>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
