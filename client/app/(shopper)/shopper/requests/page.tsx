"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Loader2, MapPin, Package, Clock, ChevronDown, ChevronUp, ImageIcon, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api";

interface PoolRequestItem {
  id: number;
  product_name: string;
  product_image: string | null;
  size_label: string;
  brand: string;
  listed_price: string;
  vendor_name: string;
  quantity: number;
}

interface PoolRequest {
  id: string;
  customer_name: string;
  delivery_city: string;
  delivery_state: string;
  customer_notes: string;
  created_at: string;
  expires_at: string | null;
  items: PoolRequestItem[];
  total_items: number;
  unique_vendors: number;
  service_fee: string;
  items_subtotal: string;
  distance_km: number | null;
}

export default function ShopperPoolPage() {
  const [requests, setRequests] = useState<PoolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPool();
  }, []);

  const fetchPool = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/shoppers/pool/', true) as { results?: PoolRequest[] } | PoolRequest[];
      const poolArray = Array.isArray(data) ? data : (data.results ?? []);
      setRequests(poolArray);
    } catch (error) {
      console.error('Failed to fetch pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      await apiClient.post(`/shoppers/pool/${requestId}/accept/`, {}, true);
      await fetchPool();
      // Redirect to my-requests
      window.location.href = '/shopper/my-requests';
    } catch (error: any) {
      alert(error?.message || 'Failed to accept request.');
    } finally {
      setAcceptingId(null);
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
          <h1 className="font-display text-2xl font-bold">Request Pool</h1>
          <p className="mt-1 text-gray-500">
            Browse and accept shopper requests near you
          </p>
        </motion.div>
        <button
          onClick={fetchPool}
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
            <p className="font-medium text-gray-600">No requests in the pool</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new requests</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {requests.map((request, i) => {
            const isExpanded = expandedId === request.id;
            
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
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{request.customer_name}</p>
                          {request.distance_km !== null && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {request.distance_km.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {request.delivery_city || request.delivery_state || 'No location'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.total_items} item{request.total_items !== 1 ? 's' : ''} • {request.unique_vendors} vendor{request.unique_vendors !== 1 ? 's' : ''} • {formatDate(request.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-display font-semibold text-purple-600">
                            {formatPrice(parseFloat(request.service_fee))}
                          </p>
                          <p className="text-xs text-gray-400">Service fee</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
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

                      {/* Summary */}
                      <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Items Subtotal</p>
                          <p className="font-semibold">₦{parseFloat(request.items_subtotal).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Your Service Fee</p>
                          <p className="font-semibold text-purple-600">₦{parseFloat(request.service_fee).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Accept button */}
                      <Button
                        onClick={() => handleAccept(request.id)}
                        disabled={acceptingId === request.id}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {acceptingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          'Accept Request'
                        )}
                      </Button>
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
