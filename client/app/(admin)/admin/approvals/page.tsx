"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approvalsApi } from "@/lib/api";
import { ArrowUpDown, Check, MoreHorizontal, Search, X, Loader2, AlertCircle } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: any = await approvalsApi.listPendingVendors();
      setApprovals(data.results || data);
    } catch (err: any) {
      console.error("Failed to fetch approvals:", err);
      setError("Failed to load pending approvals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await approvalsApi.approveVendor(id);
      if (typeof window !== "undefined") alert(`Vendor Approved: ${name} has been approved successfully.`);
      fetchApprovals();
    } catch (error: any) {
      if (typeof window !== "undefined") alert(`Error: ${error.message || "Failed to approve vendor"}`);
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await approvalsApi.rejectVendor(id);
      if (typeof window !== "undefined") alert(`Vendor Rejected: ${name} has been rejected.`);
      fetchApprovals();
    } catch (error: any) {
      if (typeof window !== "undefined") alert(`Error: ${error.message || "Failed to reject vendor"}`);
    }
  };

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

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
          <Button variant="link" className="ml-auto text-status-danger h-auto p-0" onClick={fetchApprovals}>Retry</Button>
        </div>
      )}

      <div className="bg-dark-panel rounded-lg border border-dark-border overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
               <p>No pending approvals found.</p>
            </div>
          ) : (
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
                {approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{approval.business_name || approval.username}</div>
                        <div className="text-xs text-muted-foreground">ID: {approval.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground capitalize">
                        Vendor Registration
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${(approval.status || 'pending') === 'active' ? 'bg-status-success/10 text-status-success border-status-success/20' : 
                          (approval.status || 'pending') === 'pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 
                          'bg-status-danger/10 text-status-danger border-status-danger/20'}`}>
                        {(approval.status || 'pending').charAt(0).toUpperCase() + (approval.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {approval.date_joined ? new Date(approval.date_joined).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <>
                         <Button 
                            variant="outline" 
                            size="icon" 
                            className="border-status-success/50 text-status-success hover:bg-status-success/10 transition-colors"
                            onClick={() => handleApprove(approval.id, approval.business_name || approval.username)}
                         >
                            <Check className="w-4 h-4" />
                         </Button>
                         <Button 
                            variant="outline" 
                            size="icon" 
                            className="border-status-danger/50 text-status-danger hover:bg-status-danger/10 transition-colors"
                            onClick={() => handleReject(approval.id, approval.business_name || approval.username)}
                         >
                            <X className="w-4 h-4" />
                         </Button>
                       </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
