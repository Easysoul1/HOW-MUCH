"use client";

import { useCart } from "@/lib/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, ImageIcon, UserCheck, X, Send, AlertTriangle, Store, MapPin, Truck } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { useLocation } from "@/lib/location";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalItems, totalAmount } = useCart();
  const { location, address } = useLocation();
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showMultiVendorWarning, setShowMultiVendorWarning] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showShopperForm, setShowShopperForm] = useState(false);
  
  // Delivery options state
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  // Pre-fill address from location context
  useEffect(() => {
    if (address?.address && !deliveryAddress) {
      setDeliveryAddress(address.address);
      if (address.city) setDeliveryCity(address.city);
      if (address.state) setDeliveryState(address.state);
    }
  }, [address, deliveryAddress]);

  // Group items by vendor
  const vendorGroups = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    for (const item of items) {
      const vendorKey = item.vendorName || 'Unknown';
      if (!groups[vendorKey]) groups[vendorKey] = [];
      groups[vendorKey].push(item);
    }
    return groups;
  }, [items]);

  const vendorCount = Object.keys(vendorGroups).length;
  const isMultiVendor = vendorCount > 1;

  // Backend expects Decimal(max_digits=10, decimal_places=7) for coordinates.
  // Round to 7 dp so payload never exceeds max_digits.
  const normalizeCoordinate = (value?: number | null) =>
    typeof value === "number" ? Number(value.toFixed(7)) : null;

  const handleAssignToShopper = () => {
    setShowShopperForm(true);
  };

  const handleSubmitToShopper = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address.');
      return;
    }

    setAssigning(true);
    try {
      const payload = {
        items: items.map(item => ({
          listing_id: item.listingId,
          quantity: item.quantity,
          notes: '',
        })),
        customer_notes: buyerNotes,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_state: deliveryState,
        delivery_latitude: normalizeCoordinate(location?.latitude),
        delivery_longitude: normalizeCoordinate(location?.longitude),
      };

      await apiClient.post('/shoppers/requests/', payload, true);
      
      clearCart();
      closeCart();
      setShowShopperForm(false);
      // Reset form
      setDeliveryAddress('');
      setDeliveryCity('');
      setDeliveryState('');
      setBuyerNotes('');
      router.push('/dashboard/shopper-requests');
    } catch (error: any) {
      console.error('Failed to create shopper request:', error);
      alert(error?.message || 'Failed to send to personal shopper. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleShowDeliveryForm = () => {
    if (isMultiVendor) {
      setShowMultiVendorWarning(true);
    } else {
      setShowDeliveryForm(true);
    }
  };

  const handleContinueMultiVendor = () => {
    setShowMultiVendorWarning(false);
    setShowDeliveryForm(true);
  };

  const handleMakeRequest = async () => {
    // Validate for delivery
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter a delivery address.');
      return;
    }

    setRequesting(true);
    try {
      const payload = {
        items: items.map(item => ({
          listing_id: item.listingId,
          quantity: item.quantity,
          notes: '',
        })),
        delivery_method: deliveryMethod,
        buyer_notes: buyerNotes,
        delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : '',
        delivery_city: deliveryMethod === 'delivery' ? deliveryCity : '',
        delivery_state: deliveryMethod === 'delivery' ? deliveryState : '',
        delivery_latitude: normalizeCoordinate(location?.latitude),
        delivery_longitude: normalizeCoordinate(location?.longitude),
      };

      await apiClient.post('/orders/requests/', payload, true);
      
      clearCart();
      closeCart();
      setShowMultiVendorWarning(false);
      setShowDeliveryForm(false);
      // Reset form
      setDeliveryMethod('delivery');
      setDeliveryAddress('');
      setDeliveryCity('');
      setDeliveryState('');
      setBuyerNotes('');
      router.push('/dashboard/orders');
    } catch (error: any) {
      console.error('Failed to create request:', error);
      alert(error?.message || 'Failed to send request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={v => !v && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-white">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <SheetTitle className="text-base font-semibold text-gray-900">
              {showShopperForm ? 'Personal Shopper' : showDeliveryForm ? 'Delivery Options' : 'My Cart'}
              {!showDeliveryForm && !showShopperForm && totalItems > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              )}
            </SheetTitle>
          </div>
          {items.length > 0 && !showDeliveryForm && !showShopperForm && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
          {showDeliveryForm && (
            <button
              onClick={() => setShowDeliveryForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to cart
            </button>
          )}
          {showShopperForm && (
            <button
              onClick={() => setShowShopperForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to cart
            </button>
          )}
        </SheetHeader>

        {/* Multi-vendor warning modal */}
        {showMultiVendorWarning && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="font-bold text-lg">Multiple Vendors</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your cart contains items from <strong>{vendorCount} different vendors</strong>. 
                This means you'll receive {vendorCount} separate offers and may need to coordinate 
                multiple deliveries.
              </p>
              <p className="text-sm text-gray-600">
                For a simpler experience, consider using <strong>Assign to Shopper</strong> — 
                a personal shopper will handle everything for you.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleContinueMultiVendor}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Send className="w-4 h-4" />
                  Continue with {vendorCount} Vendors
                </button>
                <button
                  onClick={() => setShowMultiVendorWarning(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Form View */}
        {showDeliveryForm ? (
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
            {/* Delivery Method Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Delivery Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    deliveryMethod === 'delivery'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-6 h-6" />
                  <span className="text-sm font-medium">Delivery</span>
                  <span className="text-xs text-gray-500">To your address</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    deliveryMethod === 'pickup'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Store className="w-6 h-6" />
                  <span className="text-sm font-medium">Pickup</span>
                  <span className="text-xs text-gray-500">From vendor</span>
                </button>
              </div>
            </div>

            {/* Address Fields (only for delivery) */}
            {deliveryMethod === 'delivery' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {deliveryMethod === 'pickup' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Pickup from Vendor</p>
                    <p className="text-blue-600 mt-1">
                      You'll receive the vendor's store address after your offer is accepted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes for Vendor <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vendors</span>
                <span className="font-medium">{vendorCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium capitalize">{deliveryMethod}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-medium text-gray-700">Subtotal</span>
                <span className="font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : showShopperForm ? (
          /* Shopper Form View */
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-700">Personal Shopper Service</div>
                  <p className="text-sm text-purple-600 mt-1">
                    A personal shopper will handle your entire order — sourcing items from multiple vendors and delivering to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address (required for shopper) */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Special Instructions <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="Any preferences, alternatives, or special instructions..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vendors</span>
                <span className="font-medium">{vendorCount}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-medium text-gray-700">Items Subtotal</span>
                <span className="font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Service fee will be calculated by the shopper based on items and vendors.
              </p>
            </div>
          </div>
        ) : (
          /* Items View */
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-3">
                <ShoppingCart className="w-12 h-12 text-gray-200" />
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-sm text-gray-400">Search for products and add them here</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.listingId} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {/* Image */}
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {item.brand && <span className="text-xs text-gray-400">{item.brand} ·</span>}
                      <span className="text-xs text-blue-600 font-medium">{item.sizeLabel}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{item.vendorName}{item.vendorCity ? ` · ${item.vendorCity}` : ""}</p>

                    {/* Price + qty */}
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-gray-900 text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item.listingId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-gray-800 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.listingId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.listingId)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3 bg-white">
            {showDeliveryForm ? (
              /* Submit Request Button */
              <button
                onClick={handleMakeRequest}
                disabled={requesting || (deliveryMethod === 'delivery' && !deliveryAddress.trim())}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                {requesting ? "Sending Request..." : `Send Request to ${vendorCount} Vendor${vendorCount > 1 ? 's' : ''}`}
              </button>
            ) : showShopperForm ? (
              /* Submit to Shopper Button */
              <button
                onClick={handleSubmitToShopper}
                disabled={assigning || !deliveryAddress.trim()}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                {assigning ? "Sending to Shopper..." : "Send to Personal Shopper"}
              </button>
            ) : (
              <>
                {/* Multi-vendor info */}
                {isMultiVendor && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700">
                    <Store className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Items from {vendorCount} vendors — requests will be sent separately</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                  <span className="text-lg font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShowDeliveryForm}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Make Request
                  </button>
                  <button
                    onClick={handleAssignToShopper}
                    disabled={assigning}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 disabled:opacity-70 text-purple-700 font-semibold py-3 rounded-xl transition-colors text-sm border border-purple-200"
                  >
                    <UserCheck className="w-4 h-4" />
                    {assigning ? "..." : "Use Shopper"}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Make Request sends directly to vendors • Use Shopper for a personal shopping service
                </p>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
