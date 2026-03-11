import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { ANALYTICS_DATA } from "@/lib/mock-data";
import { BarChart3, Users, Store, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Platform overview and performance metrics.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          trend="down"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Revenue Overview</h3>
                <BarChart3 className="w-4 h-4 text-gray-400"/>
             </div>
             <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                Chart Placeholder
             </div>
        </div>
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Recent Activity</h3>
            </div>
             <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 truncate">New Vendor Registration</p>
                            <p className="text-xs text-gray-500 truncate">Mama Nkechi Provisions joined.</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">2m ago</span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
