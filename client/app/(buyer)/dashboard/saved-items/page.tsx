"use client";

import { useState, useEffect } from "react";
import { Loader2, Heart, Trash2, Store, MapPin, TrendingUp, TrendingDown, Minus, ImageIcon, BarChart3, X, ShoppingCart, BadgeCheck, AlertTriangle } from "lucide-react";
import { savedItemsApi, priceHistoryApi } from "@/lib/api";
import { useSavedItems } from "@/lib/saved-items";
import { useCart } from "@/lib/cart";

interface SavedItem {
  id: number;
  listing: number;
  listing_detail: {
    id: number;
    product_name: string;
    product_slug: string;
    product_image: string | null;
    size_label: string;
    brand: string;
    price: string;
    is_available: boolean;
    vendor_name: string;
    vendor_city: string | null;
    vendor_state: string | null;
    vendor_verified: boolean;
    vendor_latitude: string | null;
    vendor_longitude: string | null;
    distance_km: number | null;
    updated_at: string;
    price_change_pct: number | null;
  };
  notes: string;
  saved_at: string;
}

interface PricePoint { price: string; recorded_at: string; }
type Listing = SavedItem['listing_detail'];

const CHART_COLORS = ['#16a34a', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];

function PriceChart({ items }: { items: Listing[] }) {
  const [allSeries, setAllSeries] = useState<{ listing: Listing; points: PricePoint[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      items.map(async (listing) => {
        try {
          const data = await priceHistoryApi.get({ listing_id: listing.id, include_current: true, ordering: 'recorded_at' }) as { results?: PricePoint[]; current?: PricePoint[] };
          const history = (data as { results?: PricePoint[] }).results ?? (data as unknown as PricePoint[]);
          const current = (data as { current?: PricePoint[] }).current ?? [];
          const points = [...(Array.isArray(history) ? history : []), ...current];
          return { listing, points };
        } catch {
          return { listing, points: [] };
        }
      })
    ).then(results => { setAllSeries(results); setLoading(false); });
  }, [items]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  const allPrices = allSeries.flatMap(s => s.points.map(p => parseFloat(p.price)));
  if (allPrices.length < 2) return <p className="text-sm text-gray-400 text-center py-6">Not enough price history data yet</p>;

  const globalMin = Math.min(...allPrices);
  const globalMax = Math.max(...allPrices);
  const range = globalMax - globalMin || 1;
  const w = 320, h = 140, padTop = 20, padBot = 24, padLeft = 50, padRight = 12;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBot;

  const yLabels = [globalMin, globalMin + range / 2, globalMax].map(v => `₦${Math.round(v).toLocaleString()}`);

  const allTimes = allSeries.flatMap(s => s.points.map(p => new Date(p.recorded_at).getTime()));
  const tMin = Math.min(...allTimes);
  const tMax = Math.max(...allTimes);
  const tRange = tMax - tMin || 1;

  return (
    <div className="space-y-2">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {[0, 0.5, 1].map((pct, i) => (
          <g key={i}>
            <line x1={padLeft} y1={padTop + chartH * (1 - pct)} x2={w - padRight} y2={padTop + chartH * (1 - pct)} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={padLeft - 4} y={padTop + chartH * (1 - pct) + 4} textAnchor="end" className="fill-gray-400" fontSize="8">{yLabels[i]}</text>
          </g>
        ))}
        {allSeries.map((series, si) => {
          if (series.points.length < 2) return null;
          const color = CHART_COLORS[si % CHART_COLORS.length];
          const path = series.points.map((p, i) => {
            const x = padLeft + ((new Date(p.recorded_at).getTime() - tMin) / tRange) * chartW;
            const y = padTop + chartH - ((parseFloat(p.price) - globalMin) / range) * chartH;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');
          return <path key={si} d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </svg>
      <div className="flex flex-wrap gap-3 px-1">
        {allSeries.map((s, i) => (
          <div key={s.listing.id} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-xs text-gray-500">{s.listing.vendor_name} ({s.listing.size_label})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingDetailModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { savedIds, toggle } = useSavedItems();
  const { addItem } = useCart();
  const [saving, setSaving] = useState(false);

  const isSaved = savedIds.has(listing.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    await toggle(listing.id);
    setSaving(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      listingId: listing.id,
      productName: listing.product_name,
      productImage: listing.product_image,
      sizeLabel: listing.size_label,
      brand: listing.brand,
      price: parseFloat(listing.price),
      vendorName: listing.vendor_name,
      vendorCity: listing.vendor_city,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          {listing.product_image ? (
            <img src={listing.product_image} alt={listing.product_name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{listing.product_name}</h2>
            <p className="text-sm text-gray-500">{listing.brand} · {listing.size_label}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Price */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">Current Price</span>
            <span className="text-2xl font-bold text-green-800">₦{parseFloat(listing.price).toLocaleString()}</span>
          </div>

          {/* Price History Chart */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              Price History
            </h3>
            <PriceChart items={[listing]} />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Vendor</span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                {listing.vendor_name}
                {listing.vendor_verified ? (
                  <span className="flex items-center gap-0.5 text-green-600" title="Verified Vendor">
                    <BadgeCheck className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-amber-500" title="Unverified Vendor">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                )}
              </span>
            </div>
            {!listing.vendor_verified && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <strong>⚠️ Unverified Vendor:</strong> This vendor has not completed verification. Exercise caution when making purchases.
              </div>
            )}
            {(listing.vendor_city || listing.vendor_state) && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {[listing.vendor_city, listing.vendor_state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {listing.distance_km != null && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Distance</span>
                <span className="text-sm font-medium text-blue-600">
                  {listing.distance_km < 1 ? `${Math.round(listing.distance_km * 1000)}m away` : `${listing.distance_km}km away`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Price Trend</span>
              <PriceTrendBadge pct={listing.price_change_pct} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm text-gray-700">{timeAgo(listing.updated_at)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                isSaved
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!listing.is_available}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {listing.is_available ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return "just now";
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

function PriceTrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  if (pct === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
      <Minus className="w-3 h-3" /> No change
    </span>
  );
  if (pct > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
      <TrendingUp className="w-3 h-3" /> +{pct}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
      <TrendingDown className="w-3 h-3" /> {pct}%
    </span>
  );
}

export default function SavedItemsPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { refresh } = useSavedItems();

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await savedItemsApi.list();
      const results = (data as { results?: SavedItem[] }).results ?? (data as SavedItem[]);
      setItems(results);
    } catch (err) {
      console.error("Failed to fetch saved items:", err);
      setError("Failed to load saved items. Please try again.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (savedItemId: number) => {
    try {
      setRemoving(savedItemId);
      await savedItemsApi.remove(savedItemId);
      setItems(items.filter(item => item.id !== savedItemId));
      refresh(); // Update the context
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Items</h1>
        <p className="mt-1 text-gray-500">Track prices for items you've saved.</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchSavedItems}
            className="mt-3 text-sm text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No saved items yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click the heart icon on any listing to save it here.
          </p>
        </div>
      )}

      {/* Saved items list */}
      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => {
            const l = item.listing_detail;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedListing(l)}
                className="bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {l.product_image ? (
                    <img src={l.product_image} alt={l.product_name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{l.product_name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {l.brand && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l.brand}</span>}
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{l.size_label}</span>
                          {!l.is_available && (
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Unavailable</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">₦{parseFloat(l.price).toLocaleString()}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                          disabled={removing === item.id}
                          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from saved"
                        >
                          {removing === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-500">{l.vendor_name}</span>
                      </div>
                      {(l.vendor_city || l.vendor_state) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {[l.vendor_city, l.vendor_state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      <PriceTrendBadge pct={l.price_change_pct} />
                      <span className="text-xs text-gray-400">Saved {timeAgo(item.saved_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedListing && (
        <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </div>
  );
}
