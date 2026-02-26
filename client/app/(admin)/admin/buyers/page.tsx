import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, MoreHorizontal, Search, UserPlus } from "lucide-react";

const MOCK_BUYERS = [
  { id: "b1", name: "Chinedu Okeke", email: "chinedu@example.com", status: "active", totalOrders: 15, totalSpent: 125000, joinedDate: "2025-08-12" },
  { id: "b2", name: "Amina Yusuf", email: "amina@example.com", status: "active", totalOrders: 8, totalSpent: 45000, joinedDate: "2025-11-05" },
  { id: "b3", name: "Tunde Bakare", email: "tunde@example.com", status: "inactive", totalOrders: 2, totalSpent: 12000, joinedDate: "2026-01-20" },
  { id: "b4", name: "Ngozi Eze", email: "ngozi@example.com", status: "suspended", totalOrders: 0, totalSpent: 0, joinedDate: "2026-02-10" },
];

export default function BuyersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">Buyers</h1>
          <p className="text-gray-500">Manage buyer accounts and activities.</p>
        </div>
        <Button className="bg-primary text-gray-900 hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Export Buyers
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search buyers by name or email..." 
            className="pl-10 bg-white border-gray-200 text-gray-900 focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-900 hover:bg-white">Filter</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Buyer Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-gray-900">
                  Total Spent <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_BUYERS.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{buyer.name}</div>
                      <div className="text-xs text-gray-500">{buyer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${buyer.status === 'active' ? 'bg-status-success/10 text-status-success border-status-success/20' : 
                        buyer.status === 'inactive' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 
                        'bg-status-danger/10 text-status-danger border-status-danger/20'}`}>
                      {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-mono">
                    ₦{buyer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {buyer.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
