"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Search, Loader2, X, Pencil, Trash2, PackageSearch,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { listingsApi, productsApi, sizesApi } from "@/lib/api";

interface Product { id: number; name: string; slug: string; category_name: string; image: string | null; }
interface Size { id: number; label: string; }
interface Listing {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  size: number;
  size_label: string;
  brand: string;
  price: string;
  is_available: boolean;
  notes: string;
  updated_at: string;
}

const EMPTY_FORM = {
  product: "",
  size: "",
  brand: "",
  price: "",
  notes: "",
  is_available: true,
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

export default function VendorInventoryPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Product search within modal
  const [productSearch, setProductSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const isEditing = editingId !== null;

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await listingsApi.list() as { results?: Listing[] } | Listing[];
      setListings((data as { results?: Listing[] }).results ?? (data as Listing[]));
    } catch { /* empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchListings();
    (productsApi.list() as Promise<{ results?: Product[] } | Product[]>)
      .then(d => setProducts((d as { results?: Product[] }).results ?? (d as Product[])))
      .catch(() => {});
    (sizesApi.list() as Promise<{ results?: Size[] } | Size[]>)
      .then(d => setSizes((d as { results?: Size[] }).results ?? (d as Size[])))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setProductSearch("");
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (l: Listing) => {
    setForm({
      product: String(l.product),
      size: String(l.size),
      brand: l.brand,
      price: l.price,
      notes: l.notes,
      is_available: l.is_available,
    });
    setProductSearch(l.product_name);
    setEditingId(l.id);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.size || !form.price) { setError("Product, size and price are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        product: parseInt(form.product),
        size: parseInt(form.size),
        brand: form.brand,
        price: form.price,
        notes: form.notes,
        is_available: form.is_available,
      };
      if (isEditing) {
        await listingsApi.update(editingId!, payload);
      } else {
        await listingsApi.create(payload);
      }
      setShowModal(false);
      fetchListings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove listing for "${name}"?`)) return;
    try {
      await listingsApi.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch { alert("Failed to delete listing"); }
  };

  const handleToggle = async (l: Listing) => {
    setTogglingId(l.id);
    try {
      await listingsApi.update(l.id, { is_available: !l.is_available });
      setListings(prev => prev.map(x => x.id === l.id ? { ...x, is_available: !x.is_available, updated_at: new Date().toISOString() } : x));
    } catch { /* revert on failure */ }
    finally { setTogglingId(null); }
  };

  // Filtered listings
  const filtered = listings.filter(l =>
    l.product_name.toLowerCase().includes(search.toLowerCase()) ||
    l.brand.toLowerCase().includes(search.toLowerCase()) ||
    l.size_label.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered products in modal
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage the products you sell and their prices.</p>
        </div>
        <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Listing
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10 bg-white border-gray-200 placeholder:text-gray-400 focus:border-green-500"
          placeholder="Search by product, brand or size..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-white gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <PackageSearch className="w-7 h-7 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700">{search ? `No listings match "${search}"` : "No listings yet"}</p>
            <p className="text-sm text-gray-400 mt-1">Add the products you sell so buyers can find your prices.</p>
          </div>
          {!search && <Button onClick={openCreate} variant="outline">Add your first listing</Button>}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">Size</th>
                <th className="px-5 py-3 text-left">Price (₦)</th>
                <th className="px-5 py-3 text-left">Available</th>
                <th className="px-5 py-3 text-left">Updated</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {l.product_image ? (
                        <img src={l.product_image} alt={l.product_name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{l.product_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{l.brand || <span className="text-gray-300 italic">—</span>}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{l.size_label}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ₦{parseFloat(l.price).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(l)}
                      disabled={togglingId === l.id}
                      className="flex items-center gap-1.5 text-sm transition-colors"
                    >
                      {togglingId === l.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : l.is_available ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-300" />
                      )}
                      <span className={l.is_available ? "text-green-600 font-medium" : "text-gray-400"}>
                        {l.is_available ? "In stock" : "Out of stock"}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{timeAgo(l.updated_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(l.id, l.product_name)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Listing" : "Add Listing"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

              {/* Product picker */}
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Product *</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setForm(f => ({ ...f, product: "" })); }}
                    placeholder="Search products..."
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {/* Product dropdown */}
                {productSearch && !form.product && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto shadow-sm">
                    {filteredProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 px-3 py-3">No products found</p>
                    ) : filteredProducts.slice(0, 8).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                        onClick={() => { setForm(f => ({ ...f, product: String(p.id) })); setProductSearch(p.name); }}
                      >
                        {p.image && <img src={p.image} alt="" className="w-7 h-7 rounded object-cover" />}
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {form.product && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    <span>✓ {productSearch} selected</span>
                    <button type="button" onClick={() => { setForm(f => ({ ...f, product: "" })); setProductSearch(""); }} className="ml-auto text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Size */}
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Size *</Label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  required
                >
                  <option value="">Select a size</option>
                  {sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Brand / Variety</Label>
                <Input
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Gino, Sonia, Mama Gold (leave blank if generic)"
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Your Price (₦) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="pl-7 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Wholesale only, Imported, etc."
                />
              </div>

              {/* Availability */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Currently in stock / available</span>
              </label>

              {/* Footer */}
              <div className="flex gap-3 pt-1 pb-2">
                <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-700" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {isEditing ? "Save Changes" : "Add Listing"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
