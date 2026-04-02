"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, Clock, CheckCircle, XCircle, AlertTriangle, Send, RefreshCw, Store, ChevronDown, ChevronUp, ImageIcon, Truck, MapPin } from "lucide-react";
import apiClient from "@/lib/api";

interface OfferItem {
  id: number;
  request_item: number;
  offered_price: string;
  notes: string;
  product_name: string;
  size_label: string;
  brand: string;
  quantity: number;
  listed_price: string;
}

interface Offer {
  id: number;
  delivery_fee: string;
  service_fee: string;
  discount: string;
  estimated_delivery: string;
  message: string;
  is_active: boolean;
  created_at: string;
  offer_items: OfferItem[];
  items_total: string;
  grand_total: string;
}

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
  vendor: number;
  vendor_name: string;
  vendor_address: string | null;
  status: 'pending' | 'offer_made' | 'accepted' | 'rejected' | 'expired';
  fulfillment_status: string;
  delivery_method: string;
  buyer_notes: string;
  rejection_reason: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  is_expired: boolean;
  items: RequestItem[];
  latest_offer: Offer | null;
  total_items: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  offer_made: { label: 'Offer Received', color: 'bg-blue-100 text-blue-700', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertTriangle },
};

const FULFILLMENT_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  none: { label: 'Processing', color: 'bg-gray-100 text-gray-600', description: 'Your order is being processed' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', description: 'Vendor has confirmed your order' },
  preparing: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-700', description: 'Your order is being prepared' },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-700', description: 'Your order is ready' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', description: 'Your order is on its way' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', description: 'Your order has been delivered' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', description: 'This order was cancelled' },
};

export default function OrdersPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/orders/requests/', true) as { results?: PurchaseRequest[] } | PurchaseRequest[];
      setRequests((data as { results?: PurchaseRequest[] }).results ?? (data as PurchaseRequest[]));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: number, action: 'accept' | 'reject', comment = '') => {
    setRespondingId(requestId);
    try {
      await apiClient.post(`/orders/requests/${requestId}/respond/`, { action, comment }, true);
      await fetchRequests();
      setShowRejectModal(null);
      setRejectComment('');
    } catch (error) {
      console.error('Failed to respond:', error);
      alert('Failed to respond. Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleReRequest = async (requestId: number) => {
    setRespondingId(requestId);
    try {
      await apiClient.post(`/orders/requests/${requestId}/re-request/`, {}, true);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to re-request:', error);
      alert('Failed to re-request. Please try again.');
    } finally {
      setRespondingId(null);
    }
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

  const timeUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    return `${hours}h ${mins}m left`;
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
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Add items to your cart and make a request to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const config = STATUS_CONFIG[request.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === request.id;
            const offer = request.latest_offer;
            const expiryText = timeUntilExpiry(request.expires_at);

            return (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.vendor_name}</h3>
                        <p className="text-sm text-gray-500">
                          {request.total_items} item{request.total_items !== 1 ? 's' : ''} • {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expiry warning */}
                  {expiryText && request.status !== 'expired' && request.status !== 'accepted' && request.status !== 'rejected' && (
                    <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {expiryText}
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items Requested</h4>
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
                            <p className="text-sm font-semibold text-gray-900">
                              ₦{(parseFloat(item.listed_price) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer details */}
                    {offer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-3">Vendor's Offer</h4>
                        
                        {/* Offer items with prices */}
                        <div className="space-y-1 mb-3">
                          {offer.offer_items.map(oi => (
                            <div key={oi.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">{oi.product_name} x{oi.quantity}</span>
                              <span className="font-medium">
                                {parseFloat(oi.offered_price) !== parseFloat(oi.listed_price) && (
                                  <span className="line-through text-gray-400 mr-2">₦{parseFloat(oi.listed_price).toLocaleString()}</span>
                                )}
                                ₦{(parseFloat(oi.offered_price) * oi.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Fees */}
                        <div className="border-t border-blue-200 pt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items Subtotal</span>
                            <span>₦{parseFloat(offer.items_total).toLocaleString()}</span>
                          </div>
                          {parseFloat(offer.delivery_fee) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery</span>
                              <span>₦{parseFloat(offer.delivery_fee).toLocaleString()}</span>
                            </div>
                          )}
                          {parseFloat(offer.service_fee) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Service Fee</span>
                              <span>₦{parseFloat(offer.service_fee).toLocaleString()}</span>
                            </div>
                          )}
                          {parseFloat(offer.discount) > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-₦{parseFloat(offer.discount).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
                            <span>Total</span>
                            <span>₦{parseFloat(offer.grand_total).toLocaleString()}</span>
                          </div>
                        </div>

                        {offer.estimated_delivery && (
                          <p className="mt-3 text-sm text-blue-700">
                            <strong>Estimated Delivery:</strong> {offer.estimated_delivery}
                          </p>
                        )}
                        {offer.message && (
                          <p className="mt-2 text-sm text-gray-600 italic">"{offer.message}"</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {request.status === 'offer_made' && (
                        <>
                          <button
                            onClick={() => handleRespond(request.id, 'accept')}
                            disabled={respondingId === request.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            {respondingId === request.id ? 'Processing...' : 'Accept Offer'}
                          </button>
                          <button
                            onClick={() => setShowRejectModal(request.id)}
                            disabled={respondingId === request.id}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm border border-gray-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(request.status === 'expired' || request.status === 'rejected') && (
                        <button
                          onClick={() => handleReRequest(request.id)}
                          disabled={respondingId === request.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {respondingId === request.id ? 'Sending...' : 'Request Again'}
                        </button>
                      )}
                      {request.status === 'pending' && (
                        <p className="text-sm text-gray-500">Waiting for vendor to respond...</p>
                      )}
                    </div>

                    {/* Fulfillment Status for Accepted Orders */}
                    {request.status === 'accepted' && (
                      <div className="space-y-4">
                        {/* Fulfillment Progress */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800">Order Status</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${FULFILLMENT_CONFIG[request.fulfillment_status || 'none']?.color || FULFILLMENT_CONFIG.none.color}`}>
                              {FULFILLMENT_CONFIG[request.fulfillment_status || 'none']?.label || 'Processing'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {FULFILLMENT_CONFIG[request.fulfillment_status || 'none']?.description || 'Your order is being processed'}
                          </p>

                          {/* Progress Steps */}
                          <div className="mt-4 flex items-center gap-1">
                            {['confirmed', 'preparing', 'ready', request.delivery_method === 'pickup' ? 'ready' : 'out_for_delivery', 'delivered'].filter((v, i, a) => a.indexOf(v) === i).map((step, idx, arr) => {
                              const stepOrder = ['none', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
                              const currentIdx = stepOrder.indexOf(request.fulfillment_status || 'none');
                              const stepIdx = stepOrder.indexOf(step);
                              const isCompleted = stepIdx <= currentIdx && request.fulfillment_status !== 'cancelled';
                              const isCurrent = step === request.fulfillment_status;
                              
                              return (
                                <div key={step} className="flex-1 flex items-center">
                                  <div className={`h-2 w-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            {request.delivery_method === 'pickup' ? (
                              <>
                                <Store className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                  <div className="font-medium text-gray-700">Pickup from Vendor</div>
                                  {request.vendor_address && (
                                    <div className="text-sm text-gray-600 mt-1">{request.vendor_address}</div>
                                  )}
                                  {request.fulfillment_status === 'ready' && (
                                    <div className="mt-2 text-sm text-green-600 font-medium">
                                      ✓ Ready for pickup!
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                  <div className="font-medium text-gray-700">Delivery to</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {request.delivery_address || 'Address not provided'}
                                  </div>
                                  {(request.delivery_city || request.delivery_state) && (
                                    <div className="text-sm text-gray-500">
                                      {[request.delivery_city, request.delivery_state].filter(Boolean).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {request.fulfillment_status === 'delivered' && (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-4">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Order delivered successfully!</span>
                          </div>
                        )}
                        {request.fulfillment_status === 'cancelled' && (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">This order was cancelled</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejection reason */}
                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        <strong className="text-red-700">Your feedback:</strong>
                        <p className="text-red-600 mt-1">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reject modal */}
                {showRejectModal === request.id && (
                  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowRejectModal(null)}>
                    <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg">Reject Offer</h3>
                      <p className="text-sm text-gray-600">Let the vendor know why you're rejecting (optional):</p>
                      <textarea
                        value={rejectComment}
                        onChange={e => setRejectComment(e.target.value)}
                        placeholder="e.g., Price too high, need faster delivery..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(request.id, 'reject', rejectComment)}
                          disabled={respondingId === request.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          {respondingId === request.id ? 'Rejecting...' : 'Reject Offer'}
                        </button>
                        <button
                          onClick={() => { setShowRejectModal(null); setRejectComment(''); }}
                          className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
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
