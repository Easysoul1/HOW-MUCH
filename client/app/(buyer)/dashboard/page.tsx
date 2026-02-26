"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, ImageIcon, ArrowUpDown, X, SlidersHorizontal, Store, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { publicListingsApi, productsApi, sizesApi } from "@/lib/api";

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

export default function DashboardOverviewPage() {
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
  const [ordering, setOrdering] = useState("price");
  const [showFilters, setShowFilters] = useState(false);

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
      const params: { product_slug?: string; search?: string; ordering: string } = { ordering: sort };
      if (opts.product) params.product_slug = opts.product.slug;
      if (opts.search) params.search = opts.search;
      const data = await publicListingsApi.search(params) as { results?: Listing[] } | Listing[];
      setListings((data as { results?: Listing[] }).results ?? (data as Listing[]));
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

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
    setFilterSize(""); setFilterVendor(""); setFilterMinPrice(""); setFilterMaxPrice("");
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

  const hasFilters = filterSize || filterVendor || filterMinPrice || filterMaxPrice;
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

              {hasFilters && (
                <button
                  onClick={() => { setFilterSize(""); setFilterVendor(""); setFilterMinPrice(""); setFilterMaxPrice(""); }}
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
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-500">{l.vendor_name}</span>
                          </div>
                          <PriceTrendBadge pct={l.price_change_pct} />
                          <span className="text-xs text-gray-400">Updated {timeAgo(l.updated_at)}</span>
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
    </div>
  );
}
