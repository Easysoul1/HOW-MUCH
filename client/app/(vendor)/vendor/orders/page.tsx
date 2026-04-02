"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { Package, Truck, CheckCircle, Clock, MapPin, Store, User, ChevronDown, ChevronUp, AlertCircle, XCircle } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  size_label: string;
  brand: string;
  quantity: number;
  listed_price: number;
}

interface OfferItem {
  request_item_id: string;
  offered_price: number;
  notes: string;
}

interface Offer {
  id: string;
  delivery_fee: number;
  service_fee: number;
  discount: number;
  items_total: number;
  grand_total: number;
  message: string;
  estimated_delivery: string;
  offer_items: OfferItem[];
}

interface Order {
  id: string;
  buyer: string;
  buyer_name: string;
  status: string;
  fulfillment_status: string;
  delivery_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  vendor_address: string;
  buyer_notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  latest_offer: Offer | null;
  total_items: number;
}

const FULFILLMENT_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  { value: 'preparing', label: 'Preparing', icon: Package, color: 'yellow' },
  { value: 'ready', label: 'Ready', icon: Package, color: 'purple' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'orange' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ready: 'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  none: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{ orderId: string; status: string; buyerName: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get("/orders/vendor-orders/", true) as { results?: Order[] } | Order[];
      const ordersArray = Array.isArray(data) ? data : (data.results ?? []);
      setOrders(ordersArray);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setConfirmModal(null);
    setUpdatingStatus(orderId);
    try {
      await apiClient.post(`/orders/vendor-orders/${orderId}/update-status/`, {
        fulfillment_status: newStatus
      }, true);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, fulfillment_status: newStatus } : order
      ));
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusClick = (orderId: string, newStatus: string, buyerName: string) => {
    setConfirmModal({ orderId, status: newStatus, buyerName });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = FULFILLMENT_STATUSES.find(s => s.value === status);
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS.none;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {statusInfo?.icon && <statusInfo.icon className="w-3.5 h-3.5" />}
        {statusInfo?.label || 'New Order'}
      </span>
    );
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    const statusOrder = ['none', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus || 'none');
    
    // Allow moving to any status after current, or cancelled
    const available: string[] = [];
    if (currentIndex < statusOrder.length - 1) {
      available.push(statusOrder[currentIndex + 1]);
    }
    if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
      available.push('cancelled');
    }
    return available;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.fulfillment_status);
    return order.fulfillment_status === filter;
  });

  // Stats
  const stats = {
    total: orders.length,
    active: orders.filter(o => !['delivered', 'cancelled'].includes(o.fulfillment_status)).length,
    delivered: orders.filter(o => o.fulfillment_status === 'delivered').length,
    cancelled: orders.filter(o => o.fulfillment_status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage your accepted orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.active}</div>
          <div className="text-sm text-blue-600">Active</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700">{stats.delivered}</div>
          <div className="text-sm text-green-600">Delivered</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-2xl font-bold text-red-700">{stats.cancelled}</div>
          <div className="text-sm text-red-600">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'preparing', label: 'Preparing' },
          { value: 'ready', label: 'Ready' },
          { value: 'out_for_delivery', label: 'Out for Delivery' },
          { value: 'delivered', label: 'Delivered' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'all' ? 'Try a different filter' : 'Accepted orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{order.buyer_name}</span>
                      {getStatusBadge(order.fulfillment_status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>{order.total_items} item{order.total_items > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span className="capitalize flex items-center gap-1">
                        {order.delivery_method === 'pickup' ? (
                          <><Store className="w-3.5 h-3.5" /> Pickup</>
                        ) : (
                          <><Truck className="w-3.5 h-3.5" /> Delivery</>
                        )}
                      </span>
                      {order.latest_offer && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-gray-700">
                            ₦{order.latest_offer.grand_total.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      {order.delivery_method === 'pickup' ? (
                        <>
                          <Store className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-700">Pickup Order</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Customer will pick up from your store
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-700">Delivery Address</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {order.delivery_address || 'No address provided'}
                            </div>
                            {(order.delivery_city || order.delivery_state) && (
                              <div className="text-sm text-gray-500">
                                {[order.delivery_city, order.delivery_state].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {order.buyer_notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer Notes</div>
                        <div className="text-sm text-gray-700 mt-1">{order.buyer_notes}</div>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Order Items</div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => {
                        const offerItem = order.latest_offer?.offer_items.find(
                          oi => oi.request_item_id === item.id
                        );
                        return (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <span className="font-medium text-gray-800">{item.product_name}</span>
                              <div className="text-xs text-gray-500">
                                {item.brand && `${item.brand} • `}{item.size_label} × {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900">
                                ₦{((offerItem?.offered_price || item.listed_price) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Offer Summary */}
                  {order.latest_offer && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm font-medium text-green-700 mb-2">Accepted Offer</div>
                      <div className="space-y-1 text-sm">
                        {order.latest_offer.delivery_fee > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span>₦{order.latest_offer.delivery_fee.toLocaleString()}</span>
                          </div>
                        )}
                        {order.latest_offer.service_fee > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Service Fee</span>
                            <span>₦{order.latest_offer.service_fee.toLocaleString()}</span>
                          </div>
                        )}
                        {order.latest_offer.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₦{order.latest_offer.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-green-200">
                          <span>Total</span>
                          <span>₦{order.latest_offer.grand_total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Update Actions */}
                  {!['delivered', 'cancelled'].includes(order.fulfillment_status) && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-700 mb-3">Update Status</div>
                      <div className="flex flex-wrap gap-2">
                        {getNextStatuses(order.fulfillment_status).map(nextStatus => {
                          const statusInfo = FULFILLMENT_STATUSES.find(s => s.value === nextStatus);
                          const isCancel = nextStatus === 'cancelled';
                          return (
                            <button
                              key={nextStatus}
                              onClick={() => handleStatusClick(order.id, nextStatus, order.buyer_name)}
                              disabled={updatingStatus === order.id}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                                isCancel
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {statusInfo?.icon && <statusInfo.icon className="w-4 h-4" />}
                              {updatingStatus === order.id ? 'Updating...' : `Mark as ${statusInfo?.label}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Completed/Cancelled Status */}
                  {order.fulfillment_status === 'delivered' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">This order has been delivered</span>
                    </div>
                  )}
                  {order.fulfillment_status === 'cancelled' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">This order has been cancelled</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            {(() => {
              const statusInfo = FULFILLMENT_STATUSES.find(s => s.value === confirmModal.status);
              const isCancel = confirmModal.status === 'cancelled';
              return (
                <>
                  <div className={`flex items-center gap-3 ${isCancel ? 'text-red-600' : 'text-green-600'}`}>
                    {statusInfo?.icon && <statusInfo.icon className="w-8 h-8" />}
                    <h3 className="font-bold text-lg text-gray-900">Confirm Status Update</h3>
                  </div>
                  <p className="text-gray-600">
                    Are you sure you want to mark <strong>{confirmModal.buyerName}</strong>'s order as{' '}
                    <span className={`font-semibold ${isCancel ? 'text-red-600' : 'text-green-600'}`}>
                      {statusInfo?.label}
                    </span>?
                  </p>
                  {isCancel && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      ⚠️ This action cannot be undone. The customer will be notified.
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => updateStatus(confirmModal.orderId, confirmModal.status)}
                      disabled={updatingStatus === confirmModal.orderId}
                      className={`flex-1 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
                        isCancel
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {updatingStatus === confirmModal.orderId ? 'Updating...' : 'Yes, Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
