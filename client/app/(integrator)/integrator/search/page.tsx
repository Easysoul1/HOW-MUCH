"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, Package, Info } from "lucide-react";
import { integratorApi } from "@/lib/api";

interface PriceResult {
  id: number;
  product: string;
  product_slug: string;
  size: string;
  brand: string;
  price: string;
  vendor_location: { city: string; state: string };
  is_available: boolean;
  updated_at: string;
}

export default function SearchPreviewPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await integratorApi.previewSearch(query.trim());
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Search Preview</h1>
        <p className="mt-1 text-gray-500">
          Visually explore the API data. This preview is free and doesn&apos;t count against your quota.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products, brands, categories... (e.g. rice, tomato, garri)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-white"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || query.trim().length < 2}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          This is a preview of what the <code className="bg-blue-100 px-1 rounded">/api/v1/search/</code> endpoint returns.
          The actual API supports additional params: <code className="bg-blue-100 px-1 rounded">city</code>,{" "}
          <code className="bg-blue-100 px-1 rounded">latitude</code>, <code className="bg-blue-100 px-1 rounded">longitude</code>,{" "}
          <code className="bg-blue-100 px-1 rounded">max_distance</code>.
        </p>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No results found for &quot;{query}&quot;</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? "s" : ""}</p>

          <div className="grid gap-3">
            {results.map((r) => (
              <Card key={r.id} className="border-gray-200 bg-white hover:border-green-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{r.product}</h3>
                        {r.brand && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{r.brand}</span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{r.size}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        {(r.vendor_location.city || r.vendor_location.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {[r.vendor_location.city, r.vendor_location.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Updated {new Date(r.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">₦{Number(r.price).toLocaleString()}</p>
                      <span className={`text-xs ${r.is_available ? "text-green-600" : "text-red-500"}`}>
                        {r.is_available ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* API equivalent */}
          <Card className="border-gray-200 bg-gray-900 text-gray-100">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-2">Equivalent API call:</p>
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{`curl -H "X-API-Key: hm_live_your_key" \\
  "https://api.howmuch.ng/api/v1/search/?q=${encodeURIComponent(query)}"`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {!searched && !loading && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Search for products to preview API results</p>
            <p className="text-sm text-gray-400 mt-1">Try &quot;rice&quot;, &quot;tomato paste&quot;, or &quot;garri&quot;</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
