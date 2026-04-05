"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, UserCheck, ChevronDown, ChevronUp, ImageIcon, Star, Truck, MapPin } from "lucide-react";
import apiClient from "@/lib/api";

interface RequestItem {
  id: number;
  product_name: string;
  product_image: string | null;
  size_label: string;
  brand: string;
  listed_price: string;
  vendor_name: string;
  quantity: number;
}

interface OfferItem {
  id: number;
  request_item: number;
  offered_price: string;
  product_name: string;
  size_label: string;
  brand: string;
  quantity: number;
  listed_price: string;
}

interface Offer {
  id: number;
  items_total: string;
  delivery_fee: string;
  service_fee: string;
  grand_total: string;
  estimated_delivery: string;
  message: string;
  is_active: boolean;
  offer_items: OfferItem[];
}

interface ShopperRequest {
  id: string;
  customer_name: string;
  shopper: number | null;
  shopper_name: string | null;
  status: string;
  customer_notes: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  items: RequestItem[];
  latest_offer: Offer | null;
  total_items: number;
  unique_vendors: number;
  service_fee: string;
  items_subtotal: string;
  rating: { rating: number; comment: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Finding Shopper', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  accepted: { label: 'Shopper Assigned', color: 'bg-blue-100 text-blue-700', icon: UserCheck },
  offer_made: { label: 'Offer Received', color: 'bg-purple-100 text-purple-700', icon: Package },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  in_progress: { label: 'Shopping', color: 'bg-orange-100 text-orange-700', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: AlertTriangle },
};

export default function ShopperRequestsPage() {
  const [requests, setRequests] = useState<ShopperRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/shoppers/requests/', true) as { results?: ShopperRequest[] } | ShopperRequest[];
      const requestsArray = Array.isArray(data) ? data : (data.results ?? []);
      setRequests(requestsArray);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    setRespondingId(requestId);
    try {
      await apiClient.post(`/shoppers/requests/${requestId}/respond/`, { action }, true);
      await fetchRequests();
    } catch (error: any) {
      alert(error?.message || 'Failed to respond.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    setRespondingId(requestId);
    try {
      await apiClient.post(`/shoppers/requests/${requestId}/cancel/`, {}, true);
      await fetchRequests();
    } catch (error: any) {
      alert(error?.message || 'Failed to cancel.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleRate = async (requestId: string) => {
    setRespondingId(requestId);
    try {
      await apiClient.post(`/shoppers/requests/${requestId}/rate/`, {
        rating,
        comment: ratingComment,
      }, true);
      setShowRatingModal(null);
      setRating(5);
      setRatingComment('');
      await fetchRequests();
    } catch (error: any) {
      alert(error?.message || 'Failed to submit rating.');
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Shopper Requests</h1>
          <p className="text-gray-500 mt-1">Track your requests to personal shoppers</p>
        </div>
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
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No shopper requests yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add items to your cart and choose "Use Shopper" to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.open;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === request.id;
            const offer = request.latest_offer;

            return (
              <div key={request.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.shopper_name ? `Shopper: ${request.shopper_name}` : 'Finding a shopper...'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.total_items} item{request.total_items !== 1 ? 's' : ''} from {request.unique_vendors} vendor{request.unique_vendors !== 1 ? 's' : ''} • {formatDate(request.created_at)}
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
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Delivery address */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Delivery to: </span>
                          <span className="text-gray-600">{request.delivery_address}</span>
                          {(request.delivery_city || request.delivery_state) && (
                            <span className="text-gray-500"> • {[request.delivery_city, request.delivery_state].filter(Boolean).join(', ')}</span>
                          )}
                        </div>
                      </div>
                      {request.customer_notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">"{request.customer_notes}"</p>
                      )}
                    </div>

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
                              <p className="text-xs text-gray-400">{item.vendor_name}</p>
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
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-purple-800 mb-3">Shopper's Offer</h4>
                        
                        {/* Fees */}
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items Total</span>
                            <span>₦{parseFloat(offer.items_total).toLocaleString()}</span>
                          </div>
                          {parseFloat(offer.delivery_fee) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery</span>
                              <span>₦{parseFloat(offer.delivery_fee).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee</span>
                            <span>₦{parseFloat(offer.service_fee).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg pt-2 border-t border-purple-200">
                            <span>Total</span>
                            <span>₦{parseFloat(offer.grand_total).toLocaleString()}</span>
                          </div>
                        </div>

                        {offer.estimated_delivery && (
                          <p className="mt-3 text-sm text-purple-700">
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
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                          >
                            {respondingId === request.id ? 'Processing...' : 'Accept Offer'}
                          </button>
                          <button
                            onClick={() => handleRespond(request.id, 'reject')}
                            disabled={respondingId === request.id}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm border border-gray-200"
                          >
                            Request Changes
                          </button>
                        </>
                      )}
                      
                      {request.status === 'open' && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          disabled={respondingId === request.id}
                          className="flex-1 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          Cancel Request
                        </button>
                      )}

                      {request.status === 'completed' && !request.rating && (
                        <button
                          onClick={() => setShowRatingModal(request.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <Star className="w-4 h-4" />
                          Rate Shopper
                        </button>
                      )}

                      {request.status === 'completed' && request.rating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Your rating:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i <= request.rating!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {['open', 'accepted'].includes(request.status) && (
                        <p className="text-sm text-gray-500">
                          {request.status === 'open' ? 'Looking for an available shopper...' : 'Shopper is preparing your offer...'}
                        </p>
                      )}

                      {['confirmed', 'in_progress'].includes(request.status) && (
                        <p className="text-sm text-purple-600 font-medium">
                          {request.status === 'confirmed' ? '✓ Confirmed! Shopper will begin shopping soon.' : '🛒 Your shopper is shopping for your items!'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rating modal */}
                {showRatingModal === request.id && (
                  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowRatingModal(null)}>
                    <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg">Rate Your Shopper</h3>
                      <p className="text-sm text-gray-600">How was your experience with {request.shopper_name}?</p>
                      
                      <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            onClick={() => setRating(i)}
                            className="p-1"
                          >
                            <Star className={`w-8 h-8 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={ratingComment}
                        onChange={e => setRatingComment(e.target.value)}
                        placeholder="Leave a comment (optional)"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRate(request.id)}
                          disabled={respondingId === request.id}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          {respondingId === request.id ? 'Submitting...' : 'Submit Rating'}
                        </button>
                        <button
                          onClick={() => { setShowRatingModal(null); setRating(5); setRatingComment(''); }}
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
