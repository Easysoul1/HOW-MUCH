"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vendorsApi } from "@/lib/api";
import { ArrowUpDown, MoreHorizontal, Search, UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: any = await vendorsApi.list();
      // Django DRF paginated responses contain { results: [...] }
      setVendors(data.results || data);
    } catch (err: any) {
      console.error("Failed to fetch vendors:", err);
      setError("Failed to load vendors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="flex items-center gap-4 bg-dark-panel p-4 rounded-lg border border-dark-border">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors..." 
                className="pl-10 bg-dark-panel border-dark-border text-white focus:ring-primary"
              />
          </div>
          <Button variant="outline" className="border-dark-border text-white hover:bg-dark-panel">Filter</Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
          <Button variant="link" className="ml-auto text-status-danger h-auto p-0" onClick={fetchVendors}>Retry</Button>
        </div>
      )}

      <div className="bg-dark-panel rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                 <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                 <p>No vendors found.</p>
              </div>
            ) : (
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
                      {vendors.map((vendor) => (
                          <tr key={vendor.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div 
                                        className="w-10 h-10 rounded-full bg-cover bg-center border border-dark-border"
                                        style={{ backgroundImage: `url(${vendor.image_url || 'https://via.placeholder.com/150'})` }}
                                      />
                                      <div>
                                          <div className="font-medium text-white">{vendor.business_name || vendor.username || 'Unnamed Vendor'}</div>
                                          <div className="text-xs text-muted-foreground">{vendor.city ? `${vendor.city}, ${vendor.state}` : 'Location unknown'}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${vendor.status === 'active' ? 'bg-status-success/10 text-status-success border-status-success/20' : 
                                      vendor.status === 'pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 
                                      'bg-status-danger/10 text-status-danger border-status-danger/20'}`}>
                                      {(vendor.status || 'pending').charAt(0).toUpperCase() + (vendor.status || 'pending').slice(1)}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-white font-mono">
                                  ₦{(vendor.revenue || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                  {vendor.date_joined ? new Date(vendor.date_joined).toLocaleDateString() : 'N/A'}
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
            )}
          </div>
      </div>
    </div>
  );
}
