"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, Clock, CheckCircle, XCircle, AlertTriangle, Send, RefreshCw, User, ChevronDown, ChevronUp, ImageIcon, MapPin } from "lucide-react";
import apiClient from "@/lib/api";

interface RequestItem {
  id: number;
  listing: number;
  product_name: string;
  product_image: string | null;
  size_label: string;
  brand: string;
  listed_price: string;
  quantity: number;
  notes: string;
}

interface PurchaseRequest {
  id: number;
  buyer: number;
  buyer_name: string;
  status: 'pending' | 'offer_made' | 'accepted' | 'rejected' | 'expired';
  buyer_notes: string;
  rejection_reason: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  items: RequestItem[];
  total_items: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  offer_made: { label: 'Offer Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertTriangle },
};

export default function VendorRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [makingOffer, setMakingOffer] = useState<number | null>(null);
  const [offerForm, setOfferForm] = useState<{
    items: Record<number, { price: string; notes: string }>;
    delivery_fee: string;
    service_fee: string;
    discount: string;
    estimated_delivery: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/orders/vendor-requests/', true) as { results?: PurchaseRequest[] } | PurchaseRequest[];
      setRequests((data as { results?: PurchaseRequest[] }).results ?? (data as PurchaseRequest[]));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startMakingOffer = (request: PurchaseRequest) => {
    const items: Record<number, { price: string; notes: string }> = {};
    request.items.forEach(item => {
      items[item.id] = { price: item.listed_price, notes: '' };
    });
    setOfferForm({
      items,
      delivery_fee: '0',
      service_fee: '0',
      discount: '0',
      estimated_delivery: '',
      message: '',
    });
    setMakingOffer(request.id);
  };

  const handleSubmitOffer = async (requestId: number) => {
    if (!offerForm) return;

    try {
      const payload = {
        items: Object.entries(offerForm.items).map(([id, data]) => ({
          request_item_id: parseInt(id),
          offered_price: parseFloat(data.price),
          notes: data.notes,
        })),
        delivery_fee: parseFloat(offerForm.delivery_fee) || 0,
        service_fee: parseFloat(offerForm.service_fee) || 0,
        discount: parseFloat(offerForm.discount) || 0,
        estimated_delivery: offerForm.estimated_delivery,
        message: offerForm.message,
      };

      await apiClient.post(`/orders/vendor-requests/${requestId}/offer/`, payload, true);
      await fetchRequests();
      setMakingOffer(null);
      setOfferForm(null);
    } catch (error: any) {
      console.error('Failed to make offer:', error);
      alert(error?.response?.data?.error || 'Failed to send offer. Please try again.');
    }
  };

  const calculateOfferTotal = (request: PurchaseRequest) => {
    if (!offerForm) return 0;
    let total = 0;
    request.items.forEach(item => {
      const itemData = offerForm.items[item.id];
      if (itemData) {
        total += (parseFloat(itemData.price) || 0) * item.quantity;
      }
    });
    total += parseFloat(offerForm.delivery_fee) || 0;
    total += parseFloat(offerForm.service_fee) || 0;
    total -= parseFloat(offerForm.discount) || 0;
    return total;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Incoming Requests</h1>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Offer Sent', count: requests.filter(r => r.status === 'offer_made').length, color: 'text-blue-600' },
          { label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length, color: 'text-green-600' },
          { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No incoming requests</p>
          <p className="text-sm text-gray-400 mt-1">When buyers request items from you, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const config = STATUS_CONFIG[request.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === request.id;
            const isOfferMode = makingOffer === request.id;

            return (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => !isOfferMode && setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.buyer_name}</h3>
                        <p className="text-sm text-gray-500">
                          {request.total_items} item{request.total_items !== 1 ? 's' : ''} • {formatDate(request.created_at)}
                        </p>
                        {request.delivery_city && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {request.delivery_city}{request.delivery_state ? `, ${request.delivery_state}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      {!isOfferMode && (isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />)}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {(isExpanded || isOfferMode) && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Buyer notes */}
                    {request.buyer_notes && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <strong className="text-gray-700">Buyer's Note:</strong>
                        <p className="text-gray-600 mt-1">{request.buyer_notes}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Items</h4>
                      <div className="space-y-2">
                        {request.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                {item.brand && `${item.brand} • `}{item.size_label} • x{item.quantity}
                              </p>
                            </div>
                            {isOfferMode && offerForm ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">₦</span>
                                <input
                                  type="number"
                                  value={offerForm.items[item.id]?.price || ''}
                                  onChange={e => setOfferForm({
                                    ...offerForm,
                                    items: { ...offerForm.items, [item.id]: { ...offerForm.items[item.id], price: e.target.value } }
                                  })}
                                  className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            ) : (
                              <p className="text-sm font-semibold text-gray-900">
                                ₦{(parseFloat(item.listed_price) * item.quantity).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer form */}
                    {isOfferMode && offerForm && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
                        <h4 className="font-medium text-green-800">Make Your Offer</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Delivery Fee</label>
                            <input
                              type="number"
                              value={offerForm.delivery_fee}
                              onChange={e => setOfferForm({ ...offerForm, delivery_fee: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Service Fee (optional)</label>
                            <input
                              type="number"
                              value={offerForm.service_fee}
                              onChange={e => setOfferForm({ ...offerForm, service_fee: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Discount</label>
                            <input
                              type="number"
                              value={offerForm.discount}
                              onChange={e => setOfferForm({ ...offerForm, discount: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Est. Delivery Time</label>
                            <input
                              type="text"
                              value={offerForm.estimated_delivery}
                              onChange={e => setOfferForm({ ...offerForm, estimated_delivery: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="e.g. 2-3 hours"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Message to Buyer (optional)</label>
                          <textarea
                            value={offerForm.message}
                            onChange={e => setOfferForm({ ...offerForm, message: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Any notes for the buyer..."
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-green-200">
                          <span className="font-medium text-gray-700">Offer Total:</span>
                          <span className="text-xl font-bold text-green-700">₦{calculateOfferTotal(request).toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitOffer(request.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            Send Offer
                          </button>
                          <button
                            onClick={() => { setMakingOffer(null); setOfferForm(null); }}
                            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isOfferMode && (
                      <div className="flex gap-2">
                        {(request.status === 'pending' || request.status === 'rejected') && (
                          <button
                            onClick={() => startMakingOffer(request)}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            <Send className="w-4 h-4" />
                            {request.status === 'rejected' ? 'Send New Offer' : 'Make Offer'}
                          </button>
                        )}
                        {request.status === 'offer_made' && (
                          <button
                            onClick={() => startMakingOffer(request)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            <Send className="w-4 h-4" />
                            Modify Offer
                          </button>
                        )}
                        {request.status === 'accepted' && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Buyer accepted your offer. Prepare for fulfillment.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Rejection reason */}
                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        <strong className="text-red-700">Buyer's Feedback:</strong>
                        <p className="text-red-600 mt-1">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
