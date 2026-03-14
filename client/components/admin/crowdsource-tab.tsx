"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, MapPin, Image as ImageIcon, Package, AlertTriangle } from "lucide-react";
import { adminCrowdsourceApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CrowdsourceSubmission {
  id: number;
  crowdsourcer_email: string;
  city: string;
  state: string;
  status: string;
  location_verified: boolean;
  item_count: number;
  approved_item_count: number;
  created_at: string;
}

interface CrowdsourceItem {
  id: number;
  product_display: { slug?: string; name: string };
  size_display: { id?: number; label?: string; value?: string; unit?: string };
  price: number;
  brand: string;
  status: string;
  rejection_reason: string;
}

interface SubmissionDetail {
  id: number;
  crowdsourcer_email: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
  location_verified: boolean;
  photo_1: string | null;
  photo_2: string | null;
  photo_3: string | null;
  status: string;
  admin_notes: string;
  items: CrowdsourceItem[];
  item_count: number;
  approved_item_count: number;
  created_at: string;
}

export function CrowdsourceTab() {
  const [submissions, setSubmissions] = useState<CrowdsourceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await adminCrowdsourceApi.listSubmissions() as any;
      setSubmissions((data as { results?: CrowdsourceSubmission[] }).results ?? (data as CrowdsourceSubmission[]));
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleViewDetail = async (submissionId: number) => {
    setLoadingDetail(true);
    setDetailOpen(true);
    try {
      const detail = await adminCrowdsourceApi.getSubmission(submissionId) as SubmissionDetail;
      setSelectedSubmission(detail);
    } catch {
      alert("Failed to load submission details");
      setDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApproveItem = async (itemId: number) => {
    setActionLoading(itemId);
    try {
      await adminCrowdsourceApi.approveItem(itemId);
      // Refresh detail
      if (selectedSubmission) {
        const updated = await adminCrowdsourceApi.getSubmission(selectedSubmission.id) as SubmissionDetail;
        setSelectedSubmission(updated);
      }
      fetchSubmissions(); // Refresh list
    } catch {
      alert("Failed to approve item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectItem = async (itemId: number) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    setActionLoading(itemId);
    try {
      await adminCrowdsourceApi.rejectItem(itemId, reason);
      // Refresh detail
      if (selectedSubmission) {
        const updated = await adminCrowdsourceApi.getSubmission(selectedSubmission.id) as SubmissionDetail;
        setSelectedSubmission(updated);
      }
      fetchSubmissions();
    } catch {
      alert("Failed to reject item");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl gap-3">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <Check className="w-6 h-6 text-green-500" />
        </div>
        <p className="text-gray-900 font-medium">All caught up!</p>
        <p className="text-gray-500 text-sm">No crowdsourced submissions to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-500">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.map(submission => (
            <div key={submission.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{submission.city || 'No city'}, {submission.state || 'No state'}</p>
                  {!submission.location_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <AlertTriangle className="w-3 h-3" /> No GPS
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {submission.item_count} items · {submission.approved_item_count} approved · 
                  By {submission.crowdsourcer_email} · {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewDetail(submission.id)}
              >
                Review
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Review</DialogTitle>
            <DialogDescription>
              Review and approve/reject individual items from this submission.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : selectedSubmission && (
            <div className="space-y-6">
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-700">Location</h3>
                  {!selectedSubmission.location_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> GPS not provided — verify manually
                    </span>
                  )}
                  {selectedSubmission.location_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check className="w-3.5 h-3.5" /> GPS verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-900">
                  {selectedSubmission.address && `${selectedSubmission.address}, `}
                  {selectedSubmission.city}, {selectedSubmission.state}
                </p>
                {selectedSubmission.latitude && selectedSubmission.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedSubmission.latitude}, {selectedSubmission.longitude}
                  </p>
                )}
              </div>

              {/* Store Photos */}
              {(selectedSubmission.photo_1 || selectedSubmission.photo_2 || selectedSubmission.photo_3) && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Store Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[selectedSubmission.photo_1, selectedSubmission.photo_2, selectedSubmission.photo_3]
                      .filter(Boolean)
                      .map((photo, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={photo!} alt={`Store photo ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedSubmission.items.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-gray-900">{item.product_display.name}</p>
                            {item.brand && (
                              <span className="text-xs text-gray-500">({item.brand})</span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Size: {item.size_display.label || 
                              (item.size_display.value && item.size_display.unit ? 
                                `${item.size_display.value}${item.size_display.unit}` : 
                                'N/A')}
                          </div>
                          <div className="mt-1 text-lg font-semibold text-green-600">
                            ₦{item.price.toLocaleString()}
                          </div>
                          {item.status === 'REJECTED' && item.rejection_reason && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                              Rejected: {item.rejection_reason}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          {item.status === 'PENDING' ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveItem(item.id)}
                                disabled={actionLoading === item.id}
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectItem(item.id)}
                                disabled={actionLoading === item.id}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === 'APPROVED' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
