"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Search, ImageIcon, Package, ShieldCheck, Store } from "lucide-react";
import { adminProductsApi } from "@/lib/api";

interface PendingProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_name: string;
  image: string | null;
  suggested_by_email: string | null;
  created_at: string;
}

const TABS = [
  { id: "products", label: "Product Suggestions", icon: Package },
  { id: "kyc",      label: "KYC Verification",   icon: ShieldCheck },
  { id: "vendors",  label: "Vendor Registration", icon: Store },
] as const;
type TabId = typeof TABS[number]["id"];

export default function ApprovalsPage() {
  const [tab, setTab] = useState<TabId>("products");
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectSlug, setRejectSlug] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await adminProductsApi.pending() as { results?: PendingProduct[] } | PendingProduct[];
      setProducts((data as { results?: PendingProduct[] }).results ?? (data as PendingProduct[]));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (slug: string) => {
    setActionLoading(slug);
    try {
      await adminProductsApi.approve(slug);
      setProducts(prev => prev.filter(p => p.slug !== slug));
    } catch {
      alert("Failed to approve product");
    } finally {
      setActionLoading(null);
    }
  };

  const openReject = (slug: string) => {
    setRejectSlug(slug);
    setRejectReason("");
    setRejectError("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setRejectError("Please provide a reason"); return; }
    setRejectSubmitting(true);
    try {
      await adminProductsApi.reject(rejectSlug!, rejectReason.trim());
      setProducts(prev => prev.filter(p => p.slug !== rejectSlug));
      setRejectSlug(null);
    } catch (err: unknown) {
      setRejectError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.suggested_by_email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-white">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and action pending submissions across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-elevated p-1 rounded-lg w-fit border border-dark-border">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          const count = t.id === "products" ? products.length : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-dark-panel text-white shadow-sm" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-yellow-500 text-black" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-dark-panel border-dark-border text-white placeholder:text-muted-foreground focus:border-green-500"
              placeholder="Search by product name or vendor email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-dark-panel border border-dark-border rounded-xl gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-muted-foreground text-sm">No pending product suggestions to review.</p>
            </div>
          ) : (
            <div className="bg-dark-panel border border-dark-border rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-dark-border">
                <p className="text-sm text-muted-foreground">{filtered.length} suggestion{filtered.length !== 1 ? "s" : ""} awaiting review</p>
              </div>
              <div className="divide-y divide-dark-border">
                {filtered.map(p => (
                  <div key={p.slug} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                    {/* Image */}
                    <div className="w-12 h-12 rounded-lg bg-dark-elevated flex items-center justify-center shrink-0 overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category_name} · <span className="font-mono">{p.sku}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Suggested by <span className="text-white/70">{p.suggested_by_email ?? "Unknown"}</span>
                        {" · "}
                        {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(p.slug)}
                        disabled={actionLoading === p.slug}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                      >
                        {actionLoading === p.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReject(p.slug)}
                        disabled={actionLoading === p.slug}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KYC Tab */}
      {tab === "kyc" && (
        <div className="flex flex-col items-center justify-center py-24 bg-dark-panel border border-dark-border rounded-xl gap-3">
          <ShieldCheck className="w-10 h-10 text-muted-foreground" />
          <p className="text-white font-medium">KYC Verification</p>
          <p className="text-sm text-muted-foreground">Coming soon — KYC document review will appear here.</p>
        </div>
      )}

      {/* Vendors Tab */}
      {tab === "vendors" && (
        <div className="flex flex-col items-center justify-center py-24 bg-dark-panel border border-dark-border rounded-xl gap-3">
          <Store className="w-10 h-10 text-muted-foreground" />
          <p className="text-white font-medium">Vendor Registrations</p>
          <p className="text-sm text-muted-foreground">Coming soon — new vendor applications will appear here.</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-panel border border-dark-border rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
              <h2 className="text-lg font-semibold text-white">Reject Product</h2>
              <button onClick={() => setRejectSlug(null)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground">Provide a reason so the vendor understands what needs to change.</p>
              {rejectError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{rejectError}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white">Reason *</label>
                <textarea
                  className="w-full bg-dark-elevated border border-dark-border rounded-md px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Product already exists in catalog, please search before suggesting."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 border-dark-border text-white hover:bg-white/5" onClick={() => setRejectSlug(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={rejectSubmitting}>
                  {rejectSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
