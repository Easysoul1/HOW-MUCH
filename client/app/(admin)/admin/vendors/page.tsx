import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_VENDORS } from "@/lib/mock-data";
import { ArrowUpDown, MoreHorizontal, Search, UserMinus, UserPlus } from "lucide-react";

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-display font-medium text-white">Vendors</h1>
           <p className="text-muted-foreground">Manage vendor accounts and approvals.</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90">
             <UserPlus className="w-4 h-4 mr-2" />
             Add Vendor
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-dark-elem p-4 rounded-lg border border-dark-border">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors..." 
                className="pl-10 bg-dark-panel border-dark-border text-white focus:ring-primary"
              />
          </div>
          <Button variant="outline" className="border-dark-border text-white hover:bg-dark-panel">Filter</Button>
      </div>

      <div className="bg-dark-elem rounded-lg border border-dark-border overflow-hidden">
          <table className="w-full text-sm text-left">
              <thead className="bg-dark-panel text-muted-foreground font-medium border-b border-dark-border">
                  <tr>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-white">
                          Revenue <ArrowUpDown className="w-3 h-3" />
                      </th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                  {MOCK_VENDORS.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-full bg-cover bg-center border border-dark-border"
                                    style={{ backgroundImage: `url(${vendor.imageUrl})` }}
                                  />
                                  <div>
                                      <div className="font-medium text-white">{vendor.name}</div>
                                      <div className="text-xs text-muted-foreground">{vendor.location}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${vendor.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                  vendor.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                  'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-white font-mono">
                              ₦{vendor.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                              {vendor.joinedDate}
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
  );
}
