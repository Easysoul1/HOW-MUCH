"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Search, ImageIcon, Package, ShieldCheck, Store, Ruler, BadgeCheck, MapPin, Calendar, Eye } from "lucide-react";
import { adminProductsApi, sizeRequestsApi, vendorVerificationApi } from "@/lib/api";
import { CrowdsourceTab } from "@/components/admin/crowdsource-tab";

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

interface VendorVerification {
  id: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  business_name: string;
  nin: string;
  store_address: string;
  store_city: string;
  store_state: string;
  store_landmark: string;
  store_image_1_url: string | null;
  store_image_2_url: string | null;
  store_image_3_url: string | null;
  years_in_business: number;
  products_sold: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason: string;
  submitted_at: string;
}

const TABS = [
  { id: "products",      label: "Product Suggestions", icon: Package },
  { id: "sizes",         label: "Size Requests",        icon: Ruler },
  { id: "crowdsource",   label: "Crowdsourced Prices",  icon: Store },
  { id: "kyc",           label: "Vendor Verification",  icon: ShieldCheck },
] as const;
type TabId = typeof TABS[number]["id"];

export default function ApprovalsPage() {
  const [tab, setTab] = useState<TabId>("products");
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [sizeRequests, setSizeRequests] = useState<SizeRequest[]>([]);
  const [verifications, setVerifications] = useState<VendorVerification[]>([]);
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

  // Verification reject modal
  const [rejectVerificationId, setRejectVerificationId] = useState<number | null>(null);
  const [rejectVerificationReason, setRejectVerificationReason] = useState("");

  // Verification detail modal
  const [selectedVerification, setSelectedVerification] = useState<VendorVerification | null>(null);

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

  const fetchVerifications = async () => {
    try {
      const data = await vendorVerificationApi.adminList('PENDING') as { results?: VendorVerification[] } | VendorVerification[];
      setVerifications((data as { results?: VendorVerification[] }).results ?? (data as VendorVerification[]));
    } catch {
      setVerifications([]);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchVerifications();
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

  // Verification handlers
  const handleApproveVerification = async (id: number) => {
    setActionLoading(`v-${id}`);
    try {
      await vendorVerificationApi.adminApprove(id);
      setVerifications(prev => prev.filter(v => v.id !== id));
      setSelectedVerification(null);
    } catch { alert("Failed to approve vendor"); }
    finally { setActionLoading(null); }
  };

  const handleRejectVerification = async () => {
    if (rejectVerificationId === null) return;
    setActionLoading(`v-${rejectVerificationId}`);
    try {
      await vendorVerificationApi.adminReject(rejectVerificationId, rejectVerificationReason);
      setVerifications(prev => prev.filter(v => v.id !== rejectVerificationId));
      setRejectVerificationId(null);
      setRejectVerificationReason("");
      setSelectedVerification(null);
    } catch { alert("Failed to reject vendor"); }
    finally { setActionLoading(null); }
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

      {/* Crowdsource Tab */}
      {tab === "crowdsource" && <CrowdsourceTab />}

      {/* Vendor Verification Tab */}
      {tab === "kyc" && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-xl gap-3">
              <ShieldCheck className="w-10 h-10 text-gray-500" />
              <p className="text-gray-900 font-medium">No Pending Verifications</p>
              <p className="text-sm text-gray-500">Vendor verification requests will appear here.</p>
            </div>
          ) : (
            verifications.map(v => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Store Image Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {v.store_image_1_url ? (
                      <img src={v.store_image_1_url} alt="Store" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 font-semibold">{v.business_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{v.user_name} · {v.user_email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.store_city}, {v.store_state}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(v.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => setSelectedVerification(v)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading === `v-${v.id}`}
                      onClick={() => handleApproveVerification(v.id)}
                    >
                      {actionLoading === `v-${v.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => { setRejectVerificationId(v.id); setRejectVerificationReason(""); }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
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

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedVerification.business_name}</h2>
                  <p className="text-xs text-gray-500">Verification Request</p>
                </div>
              </div>
              <button onClick={() => setSelectedVerification(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Vendor Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.user_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.user_email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.user_phone || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">NIN (National ID)</p>
                    <p className="text-gray-900 font-medium font-mono tracking-wide">{selectedVerification.nin}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Business Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.business_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Years in Business</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.years_in_business} year{selectedVerification.years_in_business !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Products Sold</p>
                    <p className="text-gray-900 font-medium">{selectedVerification.products_sold}</p>
                  </div>
                </div>
              </div>

              {/* Store Address */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Store Location</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="text-gray-900">{selectedVerification.store_address}</p>
                  {selectedVerification.store_landmark && (
                    <p className="text-gray-500 mt-1">Landmark: {selectedVerification.store_landmark}</p>
                  )}
                  <p className="text-gray-600 mt-1">{selectedVerification.store_city}, {selectedVerification.store_state}</p>
                </div>
              </div>

              {/* Store Images */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Store Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[selectedVerification.store_image_1_url, selectedVerification.store_image_2_url, selectedVerification.store_image_3_url]
                    .filter(Boolean)
                    .map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={url!} alt={`Store photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  {![selectedVerification.store_image_1_url, selectedVerification.store_image_2_url, selectedVerification.store_image_3_url].some(Boolean) && (
                    <p className="text-sm text-gray-500 col-span-3">No images uploaded</p>
                  )}
                </div>
              </div>

              {/* Submitted Date */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Submitted on {new Date(selectedVerification.submitted_at).toLocaleDateString("en-GB", { 
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100"
                onClick={() => setSelectedVerification(null)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setRejectVerificationId(selectedVerification.id);
                  setRejectVerificationReason("");
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={actionLoading === `v-${selectedVerification.id}`}
                onClick={() => handleApproveVerification(selectedVerification.id)}
              >
                {actionLoading === `v-${selectedVerification.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Approve Vendor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Reject Modal */}
      {rejectVerificationId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Verification</h2>
              <button onClick={() => setRejectVerificationId(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-500">Let the vendor know why their verification was rejected so they can correct the issues.</p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900">Rejection Reason *</label>
                <textarea
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  value={rejectVerificationReason}
                  onChange={e => setRejectVerificationReason(e.target.value)}
                  placeholder="e.g. NIN number invalid, store images blurry, incomplete address..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" 
                  onClick={() => setRejectVerificationId(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                  onClick={handleRejectVerification} 
                  disabled={actionLoading === `v-${rejectVerificationId}` || !rejectVerificationReason.trim()}
                >
                  {actionLoading === `v-${rejectVerificationId}` && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
