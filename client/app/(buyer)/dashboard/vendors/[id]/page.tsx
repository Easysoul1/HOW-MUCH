"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Store, MapPin, Phone, Mail, BadgeCheck, AlertTriangle, ArrowLeft, Navigation, ShoppingCart, Heart, ImageIcon } from "lucide-react";
import { useLocation } from "@/lib/location";
import { useCart } from "@/lib/cart";
import { useSavedItems } from "@/lib/saved-items";
import apiClient from "@/lib/api";

interface Listing {
  id: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  size_label: string;
  brand: string;
  price: string;
  is_available: boolean;
  updated_at: string;
}

interface VendorDetail {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  state: string;
  address: string;
  is_verified: boolean;
  business_name: string;
  years_in_business: number | null;
  products_sold: string | null;
  store_image_url: string | null;
  verification_status: string;
  distance_km: number | null;
  listings: Listing[];
  listings_count: number;
}

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { location } = useLocation();
  const { addItem } = useCart();
  const { savedIds, toggle: toggleSave } = useSavedItems();
  
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchVendor();
  }, [params.id, location]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = new URLSearchParams();
      if (location?.latitude && location?.longitude) {
        query.set('lat', location.latitude.toString());
        query.set('lng', location.longitude.toString());
      }
      
      const data = await apiClient.get(`/vendors/${params.id}/${query.toString() ? `?${query}` : ''}`, true);
      setVendor(data as VendorDetail);
    } catch (err: any) {
      console.error("Failed to fetch vendor:", err);
      setError(err?.response?.data?.error || "Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (listingId: number) => {
    setSavingIds(prev => new Set(prev).add(listingId));
    await toggleSave(listingId);
    setSavingIds(prev => {
      const next = new Set(prev);
      next.delete(listingId);
      return next;
    });
  };

  const handleAddToCart = (listing: Listing) => {
    addItem({
      listingId: listing.id,
      productName: listing.product_name,
      productImage: listing.product_image,
      sizeLabel: listing.size_label,
      brand: listing.brand,
      price: parseFloat(listing.price),
      vendorName: vendor?.business_name || "",
      vendorCity: vendor?.city || null,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="text-center py-16">
        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-600">{error || "Vendor not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-green-600 hover:text-green-700 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to vendors</span>
      </button>

      {/* Vendor Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Store Image */}
          {vendor.store_image_url ? (
            <img src={vendor.store_image_url} alt={vendor.business_name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
          )}

          {/* Vendor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
              {vendor.is_verified ? (
                <span title="Verified Vendor"><BadgeCheck className="w-6 h-6 text-green-600" /></span>
              ) : (
                <span title="Unverified Vendor"><AlertTriangle className="w-5 h-5 text-amber-500" /></span>
              )}
            </div>

            {!vendor.is_verified && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-3">
                <strong>⚠️ Unverified Vendor:</strong> This vendor has not completed verification. Exercise caution when making purchases.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {vendor.phone_number && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone_number}</span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.city && vendor.state && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.city}, {vendor.state}</span>
                </div>
              )}
              {vendor.distance_km !== null && (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Navigation className="w-4 h-4" />
                  <span>
                    {vendor.distance_km < 1 
                      ? `${Math.round(vendor.distance_km * 1000)}m away` 
                      : `${vendor.distance_km}km away`}
                  </span>
                </div>
              )}
            </div>

            {vendor.years_in_business && (
              <p className="mt-3 text-sm text-gray-500">
                In business for <strong>{vendor.years_in_business}+ years</strong>
              </p>
            )}

            {vendor.products_sold && (
              <p className="mt-2 text-sm text-gray-600">{vendor.products_sold}</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Inventory ({vendor.listings_count})
          </h2>
        </div>

        {vendor.listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">No products listed yet</p>
            <p className="text-sm text-gray-400 mt-1">This vendor hasn't added any products to their inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.listings.map(listing => {
              const isSaved = savedIds.has(listing.id);
              const isSaving = savingIds.has(listing.id);
              
              return (
                <div key={listing.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  {/* Product Image */}
                  {listing.product_image ? (
                    <img src={listing.product_image} alt={listing.product_name} className="w-full h-32 rounded-lg object-cover mb-3" />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Product Info */}
                  <h3 className="font-semibold text-gray-900 mb-1">{listing.product_name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {listing.brand && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{listing.brand}</span>
                    )}
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{listing.size_label}</span>
                    {!listing.is_available && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Unavailable</span>
                    )}
                  </div>

                  {/* Price */}
                  <p className="text-xl font-bold text-gray-900 mb-3">₦{parseFloat(listing.price).toLocaleString()}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(listing.id)}
                      disabled={isSaving}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                        isSaved
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
                    </button>
                    <button
                      onClick={() => handleAddToCart(listing)}
                      disabled={!listing.is_available}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
