"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Upload, X, Search, ImageIcon } from "lucide-react";
import { productsApi, vendorProductsApi, categoriesApi, sizesApi } from "@/lib/api";

interface Category { id: number; name: string; slug: string; }
interface Size { id: number; label: string; }
interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_name: string;
  image: string | null;
  status: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  sizes: [] as number[],
  image: null as File | null,
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sizeSearch, setSizeSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    productsApi.list()
      .then(d => setProducts((d as { results?: Product[] }).results ?? (d as Product[])))
      .catch(() => {})
      .finally(() => setLoading(false));
    (categoriesApi.list() as Promise<{ results?: Category[] } | Category[]>)
      .then(d => setCategories((d as { results?: Category[] }).results ?? (d as Category[])))
      .catch(() => {});
    (sizesApi.list() as Promise<{ results?: Size[] } | Size[]>)
      .then(d => setSizes((d as { results?: Size[] }).results ?? (d as Size[])))
      .catch(() => {});
  }, []);

  // Client-side search filter
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setForm({ ...EMPTY_FORM });
    setImagePreview(null);
    setSizeSearch("");
    setError("");
    setSubmitted(false);
    setShowModal(true);
  };

  const toggleSize = (id: number) =>
    setForm(f => ({ ...f, sizes: f.sizes.includes(id) ? f.sizes.filter(s => s !== id) : [...f.sizes, id] }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, image: file }));
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) { setError("Name and category are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      form.sizes.forEach(id => fd.append("available_sizes", String(id)));
      if (form.image) fd.append("image", form.image);
      await vendorProductsApi.suggest(fd);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSizes = sizes.filter(s => s.label.toLowerCase().includes(sizeSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Browse the full product catalog on HowMuch.</p>
        </div>
        <Button onClick={openModal} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Suggest Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
          placeholder="Search by name, category or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
          {search ? `No products match "${search}"` : "No products in the catalog yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div key={p.slug} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.category_name}</p>
                <p className="text-xs font-mono text-gray-400">{p.sku}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggest Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Suggest a Product</h2>
                <p className="text-xs text-gray-400 mt-0.5">Goes live after admin approval</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Suggestion submitted!</h3>
                <p className="text-sm text-gray-500 max-w-xs">Your product suggestion is under review. It will appear in the catalog once approved by an admin.</p>
                <Button onClick={() => setShowModal(false)} className="mt-2 bg-green-600 hover:bg-green-700 text-white px-8">Done</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Long Grain Rice"
                    required
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Description</Label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Briefly describe the product"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Category *</Label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Sizes */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Available Sizes</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={sizeSearch}
                      onChange={e => setSizeSearch(e.target.value)}
                      placeholder="Search sizes..."
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-0.5 bg-gray-50">
                    {filteredSizes.map(s => (
                      <label key={s.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white px-2 py-1.5 rounded-md transition-colors">
                        <input type="checkbox" checked={form.sizes.includes(s.id)} onChange={() => toggleSize(s.id)} className="accent-green-600 w-3.5 h-3.5" />
                        <span className="text-sm text-gray-700">{s.label}</span>
                      </label>
                    ))}
                    {filteredSizes.length === 0 && <p className="text-xs text-gray-400 px-2 py-2">No sizes match</p>}
                  </div>
                </div>

                {/* Image */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Product Image</Label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="mx-auto h-28 object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs text-gray-300">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-1 pb-2">
                  <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit for Review
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
