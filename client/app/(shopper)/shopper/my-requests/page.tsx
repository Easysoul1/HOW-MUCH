"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { 
  Loader2, MapPin, Package, Clock, ChevronDown, ChevronUp, ImageIcon, 
  RefreshCw, CheckCircle, Send, Edit2, Truck, XCircle
} from "lucide-react";
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

interface MyRequest {
  id: string;
  customer_name: string;
  status: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  customer_notes: string;
  created_at: string;
  accepted_at: string;
  items: RequestItem[];
  latest_offer: Offer | null;
  total_items: number;
  unique_vendors: number;
  service_fee: string;
  items_subtotal: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  accepted: { label: 'Make Offer', color: 'bg-blue-100 text-blue-700', icon: Send },
  offer_made: { label: 'Offer Sent', color: 'bg-purple-100 text-purple-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  in_progress: { label: 'Shopping', color: 'bg-orange-100 text-orange-700', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [offerFormId, setOfferFormId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  // Offer form state
  const [itemPrices, setItemPrices] = useState<Record<number, string>>({});
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/shoppers/my-requests/', true) as { results?: MyRequest[] } | MyRequest[];
      const requestsArray = Array.isArray(data) ? data : (data.results ?? []);
      setRequests(requestsArray);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOfferForm = (request: MyRequest) => {
    setOfferFormId(request.id);
    // Pre-fill with existing offer or listing prices
    const prices: Record<number, string> = {};
    if (request.latest_offer) {
      request.latest_offer.offer_items.forEach(oi => {
        prices[oi.request_item] = oi.offered_price;
      });
      setDeliveryFee(request.latest_offer.delivery_fee);
      setEstimatedDelivery(request.latest_offer.estimated_delivery);
      setMessage(request.latest_offer.message);
    } else {
      request.items.forEach(item => {
        prices[item.id] = item.listed_price;
      });
      setDeliveryFee('');
      setEstimatedDelivery('');
      setMessage('');
    }
    setItemPrices(prices);
  };

  const handleSubmitOffer = async (requestId: string, items: RequestItem[]) => {
    setSubmittingId(requestId);
    try {
      const offerItems = items.map(item => ({
        request_item_id: item.id,
        offered_price: itemPrices[item.id] || item.listed_price,
      }));
      
      await apiClient.post(`/shoppers/my-requests/${requestId}/offer/`, {
        offer_items: offerItems,
        delivery_fee: deliveryFee || '0',
        estimated_delivery: estimatedDelivery,
        message,
      }, true);
      
      setOfferFormId(null);
      await fetchMyRequests();
    } catch (error: any) {
      alert(error?.message || 'Failed to submit offer.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this as "${newStatus.replace('_', ' ')}"?`)) return;
    
    setSubmittingId(requestId);
    try {
      await apiClient.post(`/shoppers/my-requests/${requestId}/update-status/`, {
        status: newStatus,
      }, true);
      await fetchMyRequests();
    } catch (error: any) {
      alert(error?.message || 'Failed to update status.');
    } finally {
      setSubmittingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotal = (request: MyRequest) => {
    const itemsTotal = request.items.reduce((sum, item) => {
      const price = parseFloat(itemPrices[item.id] || item.listed_price);
      return sum + price * item.quantity;
    }, 0);
    const delivery = parseFloat(deliveryFee) || 0;
    const serviceFee = parseFloat(request.service_fee);
    return itemsTotal + delivery + serviceFee;
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold">My Requests</h1>
          <p className="mt-1 text-gray-500">
            Manage your accepted requests and offers
          </p>
        </motion.div>
        <button
          onClick={fetchMyRequests}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">No active requests</p>
            <p className="text-sm text-gray-400 mt-1">
              <a href="/shopper/requests" className="text-purple-600 hover:underline">
                Browse the pool
              </a>{' '}
              to accept new requests
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {requests.map((request, i) => {
            const isExpanded = expandedId === request.id;
            const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.accepted;
            const StatusIcon = config.icon;
            const showOfferForm = offerFormId === request.id;
            
            return (
              <motion.li 
                key={request.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-gray-200 bg-white overflow-hidden">
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{request.customer_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {request.delivery_city || request.delivery_state || request.delivery_address || 'No address'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.total_items} item{request.total_items !== 1 ? 's' : ''} • Accepted {formatDate(request.accepted_at)}
                        </p>
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

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      {/* Delivery address */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                        <p className="text-sm text-gray-600">
                          {request.delivery_address}
                          {(request.delivery_city || request.delivery_state) && (
                            <span> • {[request.delivery_city, request.delivery_state].filter(Boolean).join(', ')}</span>
                          )}
                        </p>
                      </div>

                      {request.customer_notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-yellow-800">Customer Notes</p>
                          <p className="text-sm text-yellow-700 mt-1">{request.customer_notes}</p>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
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

                      {/* Existing offer display */}
                      {request.latest_offer && !showOfferForm && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-purple-800">Your Offer</h4>
                            {['accepted', 'offer_made'].includes(request.status) && (
                              <button
                                onClick={() => openOfferForm(request)}
                                className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Items Total</span>
                              <span>₦{parseFloat(request.latest_offer.items_total).toLocaleString()}</span>
                            </div>
                            {parseFloat(request.latest_offer.delivery_fee) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Delivery</span>
                                <span>₦{parseFloat(request.latest_offer.delivery_fee).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Service Fee</span>
                              <span>₦{parseFloat(request.latest_offer.service_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-purple-200">
                              <span>Total</span>
                              <span>₦{parseFloat(request.latest_offer.grand_total).toLocaleString()}</span>
                            </div>
                          </div>
                          {request.latest_offer.estimated_delivery && (
                            <p className="mt-2 text-sm text-purple-700">
                              <strong>Delivery:</strong> {request.latest_offer.estimated_delivery}
                            </p>
                          )}
                          {request.latest_offer.message && (
                            <p className="mt-2 text-sm text-gray-600 italic">"{request.latest_offer.message}"</p>
                          )}
                        </div>
                      )}

                      {/* Offer form */}
                      {showOfferForm ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-4">
                          <h4 className="font-semibold text-purple-800">Make Offer</h4>
                          
                          {/* Item prices */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Item Prices</p>
                            {request.items.map(item => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                                  <p className="text-xs text-gray-500">{item.size_label} • x{item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-gray-500">₦</span>
                                  <input
                                    type="number"
                                    value={itemPrices[item.id] || ''}
                                    onChange={e => setItemPrices(prev => ({ ...prev, [item.id]: e.target.value }))}
                                    className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right"
                                    placeholder={item.listed_price}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Delivery fee */}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Delivery Fee</label>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm text-gray-500">₦</span>
                              <input
                                type="number"
                                value={deliveryFee}
                                onChange={e => setDeliveryFee(e.target.value)}
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Estimated delivery */}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Estimated Delivery</label>
                            <input
                              type="text"
                              value={estimatedDelivery}
                              onChange={e => setEstimatedDelivery(e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm mt-1"
                              placeholder="e.g., Today by 5pm, Tomorrow morning"
                            />
                          </div>

                          {/* Message */}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Message (optional)</label>
                            <textarea
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              className="w-full border border-gray-200 rounded px-3 py-2 text-sm mt-1 h-20 resize-none"
                              placeholder="Any notes for the customer..."
                            />
                          </div>

                          {/* Total */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-purple-600">₦{calculateTotal(request).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Includes ₦{parseFloat(request.service_fee).toLocaleString()} service fee
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSubmitOffer(request.id, request.items)}
                              disabled={submittingId === request.id}
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                              {submittingId === request.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Offer
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setOfferFormId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {/* Action buttons based on status */}
                          {request.status === 'accepted' && (
                            <Button
                              onClick={() => openOfferForm(request)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Make Offer
                            </Button>
                          )}
                          
                          {request.status === 'confirmed' && (
                            <Button
                              onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                              disabled={submittingId === request.id}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Start Shopping
                            </Button>
                          )}
                          
                          {request.status === 'in_progress' && (
                            <Button
                              onClick={() => handleUpdateStatus(request.id, 'completed')}
                              disabled={submittingId === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Delivered
                            </Button>
                          )}

                          {['accepted', 'offer_made', 'confirmed'].includes(request.status) && (
                            <Button
                              variant="outline"
                              onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                              disabled={submittingId === request.id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
