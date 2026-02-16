import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { ANALYTICS_DATA } from "@/lib/mock-data";
import { BarChart3, Users, Store, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-medium text-white">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Revenue"
          value={ANALYTICS_DATA.totalRevenue}
          prefix="₦"
          change={12.5}
          trend="up"
        />
        <AnalyticsCard
          title="Active Vendors"
          value={ANALYTICS_DATA.activeVendors}
          change={4}
          trend="up"
        />
        <AnalyticsCard
          title="Active Buyers"
          value={ANALYTICS_DATA.activeBuyers}
          change={2.1}
          trend="up"
        />
        <AnalyticsCard
          title="Pending Approvals"
          value={ANALYTICS_DATA.pendingApprovals}
          change={5}
          trend="down" // Down is good for backlog
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-dark-elem border border-dark-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Revenue Overview</h3>
                <BarChart3 className="w-4 h-4 text-muted-foreground"/>
             </div>
             <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-white/5 rounded-lg border border-dashed border-dark-border">
                Chart Placeholder
             </div>
        </div>
        <div className="col-span-3 bg-dark-elem border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Recent Activity</h3>
            </div>
             <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-4 text-sm border-b border-dark-border/50 last:border-0 pb-3 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                            <p className="text-white">New Vendor Registration</p>
                            <p className="text-xs text-muted-foreground">Mama Nkechi Provisions joined.</p>
                        </div>
                        <span className="text-xs text-muted-foreground">2m ago</span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
