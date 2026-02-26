"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Search, ImageIcon, Package, ShieldCheck, Store, Ruler } from "lucide-react";
import { adminProductsApi, sizeRequestsApi } from "@/lib/api";

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

interface SizeRequest {
  id: number;
  product_name: string;
  product_slug: string;
  size_label: string;
  note: string;
  requested_by_email: string;
  created_at: string;
}

const TABS = [
  { id: "products",      label: "Product Suggestions", icon: Package },
  { id: "sizes",         label: "Size Requests",        icon: Ruler },
  { id: "kyc",           label: "KYC Verification",     icon: ShieldCheck },
  { id: "vendors",       label: "Vendor Registration",  icon: Store },
] as const;
type TabId = typeof TABS[number]["id"];

export default function ApprovalsPage() {
  const [tab, setTab] = useState<TabId>("products");
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [sizeRequests, setSizeRequests] = useState<SizeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectSlug, setRejectSlug] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Size request reject
  const [rejectSizeId, setRejectSizeId] = useState<number | null>(null);
  const [rejectSizeReason, setRejectSizeReason] = useState("");

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

  useEffect(() => {
    fetchPending();
    sizeRequestsApi.list('PENDING')
      .then(d => setSizeRequests((d as { results?: SizeRequest[] }).results ?? (d as SizeRequest[])))
      .catch(() => setSizeRequests([]));
  }, []);

  const handleApproveSizeRequest = async (id: number) => {
    setActionLoading(String(id));
    try {
      await sizeRequestsApi.approve(id);
      setSizeRequests(prev => prev.filter(r => r.id !== id));
    } catch { alert("Failed to approve"); }
    finally { setActionLoading(null); }
  };

  const handleRejectSizeRequest = async () => {
    if (rejectSizeId === null) return;
    try {
      await sizeRequestsApi.reject(rejectSizeId, rejectSizeReason);
      setSizeRequests(prev => prev.filter(r => r.id !== rejectSizeId));
      setRejectSizeId(null); setRejectSizeReason("");
    } catch { alert("Failed to reject"); }
  };

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
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">Review and action pending submissions across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto border border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          const count = t.id === "products" ? products.length : t.id === "sizes" ? sizeRequests.length : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-yellow-500 text-gray-900" : "bg-yellow-100 text-yellow-700"}`}>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500"
              placeholder="Search by product name or vendor email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl gap-3">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-900 font-medium">All caught up!</p>
              <p className="text-gray-500 text-sm">No pending product suggestions to review.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-500">{filtered.length} suggestion{filtered.length !== 1 ? "s" : ""} awaiting review</p>
              </div>
              <div className="divide-y divide-gray-200">
                {filtered.map(p => (
                  <div key={p.slug} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Image + Info row */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category_name} · <span className="font-mono">{p.sku}</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Suggested by <span className="text-gray-600">{p.suggested_by_email ?? "Unknown"}</span>
                          {" · "}
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 ml-13 sm:ml-0">
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
                        className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
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

      {/* Size Requests Tab */}
      {tab === "sizes" && (
        <div className="space-y-4">
          {sizeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-xl gap-3">
              <Ruler className="w-10 h-10 text-gray-500" />
              <p className="text-gray-900 font-medium">No pending size requests</p>
              <p className="text-sm text-gray-500">Vendor size suggestions will appear here.</p>
            </div>
          ) : sizeRequests.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-900 font-semibold">{r.size_label}</span>
                  <span className="text-gray-500 text-sm">for</span>
                  <span className="text-green-700 font-medium">{r.product_name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Suggested by {r.requested_by_email}</p>
                {r.note && <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{r.note}&rdquo;</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-gray-900"
                  disabled={actionLoading === String(r.id)}
                  onClick={() => handleApproveSizeRequest(r.id)}
                >
                  {actionLoading === String(r.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-500 hover:text-gray-700"
                  onClick={() => { setRejectSizeId(r.id); setRejectSizeReason(""); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KYC Tab */}
      {tab === "kyc" && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-xl gap-3">
          <ShieldCheck className="w-10 h-10 text-gray-500" />
          <p className="text-gray-900 font-medium">KYC Verification</p>
          <p className="text-sm text-gray-500">Coming soon — KYC document review will appear here.</p>
        </div>
      )}

      {/* Vendors Tab */}
      {tab === "vendors" && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-xl gap-3">
          <Store className="w-10 h-10 text-gray-500" />
          <p className="text-gray-900 font-medium">Vendor Registrations</p>
          <p className="text-sm text-gray-500">Coming soon — new vendor applications will appear here.</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Product</h2>
              <button onClick={() => setRejectSlug(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-500">Provide a reason so the vendor understands what needs to change.</p>
              {rejectError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{rejectError}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Reason *</label>
                <textarea
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Product already exists in catalog, please search before suggesting."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 border-gray-200 text-gray-900 hover:bg-gray-50" onClick={() => setRejectSlug(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-gray-900" onClick={handleReject} disabled={rejectSubmitting}>
                  {rejectSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Size Request Reject Modal */}
      {rejectSizeId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Reject Size Request</h2>
            <textarea
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 resize-none h-24 focus:outline-none focus:border-green-500"
              placeholder="Reason for rejection (optional)"
              value={rejectSizeReason}
              onChange={e => setRejectSizeReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-gray-200 text-gray-500" onClick={() => setRejectSizeId(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-gray-900" onClick={handleRejectSizeRequest}>Reject</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
