"use client";

import { useCart } from "@/lib/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, ImageIcon, UserCheck, X } from "lucide-react";
import { useState } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalItems, totalAmount } = useCart();
  const [assigning, setAssigning] = useState(false);

  const handleAssignToShopper = () => {
    // TODO: wire to shopper assignment API
    setAssigning(true);
    setTimeout(() => setAssigning(false), 1500);
    alert("Shopper assignment coming soon! Your cart has been saved.");
  };

  return (
    <Sheet open={isOpen} onOpenChange={v => !v && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-white">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <SheetTitle className="text-base font-semibold text-gray-900">
              My Cart
              {totalItems > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              )}
            </SheetTitle>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </SheetHeader>

        {/* Items */}
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
              <span className="text-lg font-bold text-gray-900">₦{totalAmount.toLocaleString()}</span>
            </div>

            {/* Assign to Shopper */}
            <button
              onClick={handleAssignToShopper}
              disabled={assigning}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <UserCheck className="w-4 h-4" />
              {assigning ? "Assigning..." : "Assign to Shopper"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              A personal shopper will source and deliver your items
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
