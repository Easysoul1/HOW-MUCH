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
          <h1 className="text-3xl font-display font-medium text-white">Buyers</h1>
          <p className="text-muted-foreground">Manage buyer accounts and activities.</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Export Buyers
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-dark-panel p-4 rounded-lg border border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search buyers by name or email..." 
            className="pl-10 bg-dark-panel border-dark-border text-white focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="border-dark-border text-white hover:bg-dark-panel">Filter</Button>
      </div>

      <div className="bg-dark-panel rounded-lg border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-dark-panel text-muted-foreground font-medium border-b border-dark-border">
              <tr>
                <th className="px-6 py-4">Buyer Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-white">
                  Total Spent <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {MOCK_BUYERS.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{buyer.name}</div>
                      <div className="text-xs text-muted-foreground">{buyer.email}</div>
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
                  <td className="px-6 py-4 text-white font-mono">
                    ₦{buyer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {buyer.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
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
