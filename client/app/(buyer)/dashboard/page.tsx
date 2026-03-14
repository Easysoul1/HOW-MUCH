"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, ImageIcon, ArrowUpDown, X, SlidersHorizontal, Store, TrendingUp, TrendingDown, Minus, MapPin, Navigation, BarChart3, Plus, Trash2, ShoppingCart } from "lucide-react";
import { publicListingsApi, productsApi, sizesApi, priceHistoryApi } from "@/lib/api";
import { useCart } from "@/lib/cart";

interface Product { id: number; name: string; slug: string; category_name: string; image: string | null; }
interface Size { id: number; label: string; }
interface Listing {
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
  vendor_latitude: string | null;
  vendor_longitude: string | null;
  distance_km: number | null;
  updated_at: string;
  price_change_pct: number | null;
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

interface PricePoint { price: string; recorded_at: string; is_current?: boolean }

// Colors for multi-line comparison chart
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

  // Collect all prices to find global min/max
  const allPrices = allSeries.flatMap(s => s.points.map(p => parseFloat(p.price)));
  if (allPrices.length < 2) return <p className="text-sm text-gray-400 text-center py-6">Not enough price history data yet</p>;

  const globalMin = Math.min(...allPrices);
  const globalMax = Math.max(...allPrices);
  const range = globalMax - globalMin || 1;
  const w = 320, h = 140, padTop = 20, padBot = 24, padLeft = 50, padRight = 12;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBot;

  // Y-axis labels
  const yLabels = [globalMin, globalMin + range / 2, globalMax].map(v => `₦${Math.round(v).toLocaleString()}`);

  // Find global time range
  const allTimes = allSeries.flatMap(s => s.points.map(p => new Date(p.recorded_at).getTime()));
  const tMin = Math.min(...allTimes);
  const tMax = Math.max(...allTimes);
  const tRange = tMax - tMin || 1;

  return (
    <div className="space-y-2">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map((pct, i) => (
          <g key={i}>
            <line x1={padLeft} y1={padTop + chartH * (1 - pct)} x2={w - padRight} y2={padTop + chartH * (1 - pct)} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={padLeft - 4} y={padTop + chartH * (1 - pct) + 4} textAnchor="end" className="fill-gray-400" fontSize="8">{yLabels[i]}</text>
          </g>
        ))}
        {/* Data lines */}
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
      {/* Legend */}
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

function CompareView({ items, onRemove, onClose, allListings, onAdd }: {
  items: Listing[];
  onRemove: (id: number) => void;
  onClose: () => void;
  allListings: Listing[];
  onAdd: (listing: Listing) => void;
}) {
  const available = allListings.filter(l => !items.find(c => c.id === l.id));

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Compare Prices</h2>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{items.length} items</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Price History Graph */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Price History</h3>
          <PriceChart items={items} />
        </div>

        {/* Add another product */}
        {available.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Add another listing to compare</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {available.slice(0, 6).map(l => (
                <button
                  key={l.id}
                  onClick={() => onAdd(l)}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-green-400 hover:bg-green-50 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600 whitespace-nowrap">{l.vendor_name} · {l.size_label} · ₦{parseFloat(l.price).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-side Comparison Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <h3 className="text-sm font-medium text-gray-700 px-4 sm:px-6 pt-4 sm:pt-5 pb-3">Side-by-Side Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 sm:px-6 py-2.5 sticky left-0 bg-gray-50">Detail</th>
                  {items.map(l => (
                    <th key={l.id} className="text-left px-4 sm:px-6 py-2.5 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 truncate">{l.vendor_name}</span>
                        <button onClick={() => onRemove(l.id)} className="text-gray-300 hover:text-red-500 shrink-0"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Product</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-900">{l.product_name}</td>)}
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Price</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 font-bold text-gray-900">₦{parseFloat(l.price).toLocaleString()}</td>)}
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Size</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-700">{l.size_label}</td>)}
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Brand</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-700">{l.brand || '—'}</td>)}
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Trend</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5"><PriceTrendBadge pct={l.price_change_pct} /></td>)}
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Location</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-700">{[l.vendor_city, l.vendor_state].filter(Boolean).join(', ') || '—'}</td>)}
                </tr>
                {items.some(l => l.distance_km != null) && (
                  <tr>
                    <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Distance</td>
                    {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-700">{l.distance_km != null ? `${l.distance_km}km` : '—'}</td>)}
                  </tr>
                )}
                <tr>
                  <td className="px-4 sm:px-6 py-2.5 text-gray-500 font-medium sticky left-0 bg-white">Updated</td>
                  {items.map(l => <td key={l.id} className="px-4 sm:px-6 py-2.5 text-gray-700">{timeAgo(l.updated_at)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { addItem, items: cartItems } = useCart();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [filterSize, setFilterSize] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterRadius, setFilterRadius] = useState("");
  const [ordering, setOrdering] = useState("price");
  const [showFilters, setShowFilters] = useState(false);

  // Buyer location
  const [buyerLat, setBuyerLat] = useState<number | null>(null);
  const [buyerLng, setBuyerLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  // Comparison
  const [compareItems, setCompareItems] = useState<Listing[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (productsApi.list() as Promise<{ results?: Product[] } | Product[]>)
      .then(d => setAllProducts((d as { results?: Product[] }).results ?? (d as Product[])))
      .catch(() => {});
    (sizesApi.list() as Promise<{ results?: Size[] } | Size[]>)
      .then(d => setSizes((d as { results?: Size[] }).results ?? (d as Size[])))
      .catch(() => {});
  }, []);

  // Product autocomplete
  useEffect(() => {
    if (!query || selectedProduct) { setSuggestions([]); setShowSuggestions(false); return; }
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [query, allProducts, selectedProduct]);

  const fetchListings = useCallback(async (opts: { product?: Product; search?: string }, sort = ordering) => {
    setLoading(true);
    setSearched(true);
    setListings([]);
    try {
      const params: { product_slug?: string; search?: string; ordering: string; lat?: number; lng?: number; radius?: number } = { ordering: sort };
      if (opts.product) params.product_slug = opts.product.slug;
      if (opts.search) params.search = opts.search;
      if (buyerLat != null && buyerLng != null) {
        params.lat = buyerLat;
        params.lng = buyerLng;
        if (filterRadius) params.radius = parseFloat(filterRadius);
      }
      const data = await publicListingsApi.search(params) as { results?: Listing[] } | Listing[];
      setListings((data as { results?: Listing[] }).results ?? (data as Listing[]));
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, [buyerLat, buyerLng, filterRadius]); // eslint-disable-line

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setShowSuggestions(false);
    fetchListings({ product }, ordering);
  };

  // Free-text search on listings (Enter without selecting a product)
  const handleFreeSearch = () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    setSelectedProduct(null);
    fetchListings({ search: query.trim() }, ordering);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setQuery("");
    setListings([]);
    setSearched(false);
    setFilterSize(""); setFilterVendor(""); setFilterMinPrice(""); setFilterMaxPrice(""); setFilterRadius("");
    inputRef.current?.focus();
  };

  const handleSortChange = (val: string) => {
    setOrdering(val);
    if (selectedProduct) fetchListings({ product: selectedProduct }, val);
    else if (searched && query) fetchListings({ search: query }, val);
  };

  // Client-side filters
  const filtered = listings.filter(l => {
    if (filterSize && l.size_label !== sizes.find(s => String(s.id) === filterSize)?.label) return false;
    if (filterVendor && !l.vendor_name.toLowerCase().includes(filterVendor.toLowerCase())) return false;
    if (filterMinPrice && parseFloat(l.price) < parseFloat(filterMinPrice)) return false;
    if (filterMaxPrice && parseFloat(l.price) > parseFloat(filterMaxPrice)) return false;
    return true;
  });

  const hasFilters = filterSize || filterVendor || filterMinPrice || filterMaxPrice || filterRadius;
  const uniqueVendors = Array.from(new Set(listings.map(l => l.vendor_name)));
  const bestPrice = filtered.length ? Math.min(...filtered.map(l => parseFloat(l.price))) : null;

  return (
    <div className="space-y-6 py-2">
      {/* Hero */}
      <div className="text-center space-y-2 pt-4 sm:pt-6 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find the best prices near you</h1>
        <p className="text-sm sm:text-base text-gray-500">Search any product to compare prices across vendors</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-2xl mx-auto" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setShowSuggestions(false); }}>
        <div className={`flex items-center gap-2 bg-white border-2 rounded-2xl px-4 py-3.5 shadow-sm transition-colors ${showSuggestions ? "border-green-500" : "border-gray-200 hover:border-gray-300"}`}>
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedProduct(null); }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={e => { if (e.key === 'Enter') handleFreeSearch(); }}
            placeholder="Search products, brands or descriptions (e.g. Gino tomatoes)..."
            className="flex-1 text-base text-gray-900 bg-transparent placeholder:text-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={handleClear} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleFreeSearch}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors shrink-0"
          >
            Search
          </button>
        </div>

        {/* Autocomplete */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map(p => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 text-left"
              >
                {p.image ? (
                  <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Filter/sort bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition-colors ${showFilters ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters {hasFilters ? `(active)` : ""}
            </button>

            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={ordering}
                onChange={e => handleSortChange(e.target.value)}
                className="text-sm text-gray-700 bg-white focus:outline-none"
              >
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-updated_at">Most recently updated</option>
              </select>
            </div>

            <span className="text-xs text-gray-400 ml-auto">
              {loading ? "Searching..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Expanded filters panel */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              {/* Vendor */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</label>
                <div className="relative">
                  <Store className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter by vendor..."
                    value={filterVendor}
                    onChange={e => setFilterVendor(e.target.value)}
                    list="vendor-list"
                    className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 w-44"
                  />
                  <datalist id="vendor-list">
                    {uniqueVendors.map(v => <option key={v} value={v} />)}
                  </datalist>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size</label>
                <select
                  value={filterSize}
                  onChange={e => setFilterSize(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">All sizes</option>
                  {sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price range (₦)</label>
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                  <input type="number" min="0" placeholder="Min" value={filterMinPrice}
                    onChange={e => setFilterMinPrice(e.target.value)}
                    className="w-16 text-sm text-gray-700 bg-white focus:outline-none placeholder:text-gray-300" />
                  <span className="text-gray-300">—</span>
                  <input type="number" min="0" placeholder="Max" value={filterMaxPrice}
                    onChange={e => setFilterMaxPrice(e.target.value)}
                    className="w-16 text-sm text-gray-700 bg-white focus:outline-none placeholder:text-gray-300" />
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Distance</label>
                <div className="flex items-center gap-2">
                  {buyerLat == null ? (
                    <button
                      onClick={() => {
                        setLocLoading(true);
                        navigator.geolocation.getCurrentPosition(
                          pos => { setBuyerLat(pos.coords.latitude); setBuyerLng(pos.coords.longitude); setLocLoading(false); },
                          () => setLocLoading(false),
                          { enableHighAccuracy: true }
                        );
                      }}
                      disabled={locLoading}
                      className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {locLoading ? "Locating..." : "Enable location"}
                    </button>
                  ) : (
                    <select
                      value={filterRadius}
                      onChange={e => {
                        setFilterRadius(e.target.value);
                        // Re-fetch with new radius
                        if (selectedProduct) fetchListings({ product: selectedProduct }, ordering);
                        else if (searched && query) fetchListings({ search: query }, ordering);
                      }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Any distance</option>
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                  )}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={() => { setFilterSize(""); setFilterVendor(""); setFilterMinPrice(""); setFilterMaxPrice(""); setFilterRadius(""); }}
                  className="self-end flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}

          {/* Listings */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="font-medium text-gray-600">No vendors are currently selling "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Check back later or try a different product.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Best price banner */}
              {bestPrice !== null && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">Best price:</span>
                  <span className="font-bold text-green-800 text-base">₦{bestPrice.toLocaleString()}</span>
                  <span className="text-green-600">— {filtered.find(l => parseFloat(l.price) === bestPrice)?.vendor_name}</span>
                </div>
              )}

              {filtered.map(l => {
                const isBest = bestPrice !== null && parseFloat(l.price) === bestPrice;
                return (
                  <div key={l.id} className={`bg-white border rounded-xl px-4 sm:px-5 py-4 hover:shadow-sm transition-shadow ${isBest ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"}`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      {l.product_image ? (
                        <img src={l.product_image} alt={l.product_name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{l.product_name}</p>
                              {isBest && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Best price</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {l.brand && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{l.brand}</span>}
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{l.size_label}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">₦{parseFloat(l.price).toLocaleString()}</p>
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
                          {l.distance_km != null && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              {l.distance_km < 1 ? `${Math.round(l.distance_km * 1000)}m away` : `${l.distance_km}km away`}
                            </span>
                          )}
                          <PriceTrendBadge pct={l.price_change_pct} />
                          <span className="text-xs text-gray-400">Updated {timeAgo(l.updated_at)}</span>
                        </div>
                        {/* Action buttons */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          {/* Compare button */}
                          {compareItems.find(c => c.id === l.id) ? (
                            <button
                              onClick={() => setCompareItems(prev => prev.filter(c => c.id !== l.id))}
                              className="flex items-center gap-1.5 text-xs border border-green-200 bg-green-50 text-green-700 rounded-lg px-3 py-1.5 font-medium"
                            >
                              <BarChart3 className="w-3.5 h-3.5" /> Added to compare
                            </button>
                          ) : (
                            <button
                              onClick={() => setCompareItems(prev => [...prev, l])}
                              className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg px-3 py-1.5 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors font-medium"
                            >
                              <Plus className="w-3.5 h-3.5" /> Compare
                            </button>
                          )}

                          {/* Add to Cart button */}
                          {cartItems.find(c => c.listingId === l.id) ? (
                            <button
                              onClick={() => addItem({
                                listingId: l.id,
                                productName: l.product_name,
                                productImage: l.product_image,
                                vendorName: l.vendor_name,
                                vendorCity: l.vendor_city,
                                sizeLabel: l.size_label,
                                brand: l.brand,
                                price: parseFloat(l.price),
                              })}
                              className="flex items-center gap-1.5 text-xs border border-green-500 bg-green-600 text-white rounded-lg px-3 py-1.5 font-medium hover:bg-green-700 transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> In cart · Add more
                            </button>
                          ) : (
                            <button
                              onClick={() => addItem({
                                listingId: l.id,
                                productName: l.product_name,
                                productImage: l.product_image,
                                vendorName: l.vendor_name,
                                vendorCity: l.vendor_city,
                                sizeLabel: l.size_label,
                                brand: l.brand,
                                price: parseFloat(l.price),
                              })}
                              className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg px-3 py-1.5 hover:border-green-500 hover:bg-green-600 hover:text-white transition-colors font-medium"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Before search */}
      {!searched && (
        <div className="text-center py-14 text-gray-300 space-y-3">
          <Search className="w-12 h-12 mx-auto" />
          <p className="text-sm text-gray-400">Type a product name above to compare prices from vendors</p>
        </div>
      )}

      {/* Floating compare bar */}
      {compareItems.length > 0 && !showCompare && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{compareItems.length} item{compareItems.length > 1 ? 's' : ''} selected</span>
          </div>
          <button
            onClick={() => setShowCompare(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
          >
            Compare
          </button>
          <button
            onClick={() => setCompareItems([])}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compare view */}
      {showCompare && (
        <CompareView
          items={compareItems}
          onRemove={(id) => {
            const next = compareItems.filter(c => c.id !== id);
            setCompareItems(next);
            if (next.length === 0) setShowCompare(false);
          }}
          onClose={() => setShowCompare(false)}
          allListings={filtered}
          onAdd={(l) => setCompareItems(prev => [...prev, l])}
        />
      )}
    </div>
  );
}
