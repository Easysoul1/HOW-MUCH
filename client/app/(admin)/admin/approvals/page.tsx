import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Check, MoreHorizontal, Search, X } from "lucide-react";

const MOCK_APPROVALS = [
  { id: "app1", vendorName: "Hassan Textiles", type: "vendor_registration", date: "2 hours ago", status: "pending", priority: "high" },
  { id: "app2", vendorName: "Mama Nkechi Provisions", type: "product_listing", date: "5 hours ago", status: "pending", priority: "normal" },
  { id: "app3", vendorName: "Olu & Sons Electronics", type: "kyc_update", date: "1 day ago", status: "reviewed", priority: "high" },
  { id: "app4", vendorName: "Iya Basira Foodstuff", type: "vendor_registration", date: "2 days ago", status: "rejected", priority: "normal" },
];

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-white">Approvals</h1>
          <p className="text-muted-foreground">Manage pending vendor registrations and product listings.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-dark-panel p-4 rounded-lg border border-dark-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by vendor name or request type..." 
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
                <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-white">
                  Request Detail <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {MOCK_APPROVALS.map((approval) => (
                <tr key={approval.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{approval.vendorName}</div>
                      <div className="text-xs text-muted-foreground">ID: {approval.id.toUpperCase()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground capitalize">
                      {approval.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${approval.status === 'reviewed' ? 'bg-status-success/10 text-status-success border-status-success/20' : 
                        approval.status === 'pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 
                        'bg-status-danger/10 text-status-danger border-status-danger/20'}`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                    {approval.priority === 'high' && (
                       <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">
                         HIGH PRIORITY
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {approval.date}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {approval.status === 'pending' ? (
                       <>
                         <Button variant="outline" size="icon" className="border-status-success/50 text-status-success hover:bg-status-success/10 transition-colors">
                            <Check className="w-4 h-4" />
                         </Button>
                         <Button variant="outline" size="icon" className="border-status-danger/50 text-status-danger hover:bg-status-danger/10 transition-colors">
                            <X className="w-4 h-4" />
                         </Button>
                       </>
                    ) : (
                       <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                         <MoreHorizontal className="w-4 h-4" />
                       </Button>
                    )}
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
