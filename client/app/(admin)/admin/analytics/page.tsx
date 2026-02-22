import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { ANALYTICS_DATA, MOCK_ORDERS } from "@/lib/mock-data";
import { ArrowUpRight, BarChart3, CreditCard, Users, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "@/components/charts/price-chart";

const REVENUE_CHART_DATA = ANALYTICS_DATA.revenueHistory.map(item => ({ date: item.name, price: item.value }));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-white">Analytics</h1>
          <p className="text-muted-foreground">Detailed system performance, traffic, and sales data.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Platform Revenue"
          value={`₦${ANALYTICS_DATA.totalRevenue.toLocaleString()}`}
          trend="+12.5% from last month"
          trendUp={true}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Active Buyers"
          value={ANALYTICS_DATA.activeBuyers.toLocaleString()}
          trend="+5.2% from last month"
          trendUp={true}
          icon={<Users className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Active Vendors"
          value={ANALYTICS_DATA.activeVendors.toLocaleString()}
          trend="+1.2% from last month"
          trendUp={true}
          icon={<Store className="w-4 h-4" />}
        />
        <AnalyticsCard
          title="Conversion Rate"
          value="3.2%"
          trend="-0.4% from last month"
          trendUp={false}
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-4 bg-dark-panel border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-medium text-white">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Weekly platform transaction volume.</p>
            </div>
          </div>
          <PriceChart data={REVENUE_CHART_DATA} height={300} color="#00D084" />
        </div>

        <div className="col-span-3 bg-dark-panel border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-white">Top Performing Categories</h3>
              <p className="text-sm text-muted-foreground">Revenue by category breakdown.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-medium">G</div>
                 <div>
                    <h4 className="text-sm font-medium text-white">Groceries</h4>
                    <p className="text-xs text-muted-foreground">12,450 transactions</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-medium text-white">₦24.5M</p>
                 <p className="text-xs text-status-success flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3" /> +14%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-medium">E</div>
                 <div>
                    <h4 className="text-sm font-medium text-white">Electronics</h4>
                    <p className="text-xs text-muted-foreground">8,200 transactions</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-medium text-white">₦18.2M</p>
                 <p className="text-xs text-status-success flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3" /> +8%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 font-medium">F</div>
                 <div>
                    <h4 className="text-sm font-medium text-white">Fashion</h4>
                    <p className="text-xs text-muted-foreground">3,100 transactions</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-medium text-white">₦2.3M</p>
                 <p className="text-xs text-status-success flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3" /> +1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
