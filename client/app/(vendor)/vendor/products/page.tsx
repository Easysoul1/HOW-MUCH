"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api";
import { Edit2, MoreVertical, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Vendor specifically only needs their own products, assuming API handles this or we pass a param natively later.
      const data: any = await productsApi.list();
      setProducts(data.results || data);
      
      // If we got an empty array but expected data for testing purposes, we can uncomment below
      // if ((data.results || data).length === 0) throw new Error("No products returned");
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      // Fallback
      setProducts(MOCK_PRODUCTS);
      setError("Displaying mock products due to server error or empty response.");
    } finally {
      setIsLoading(false);
    }
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Upload, X, Search, ImageIcon, ArrowLeft } from "lucide-react";
import { productsApi, vendorProductsApi, categoriesApi, sizesApi, unitsApi } from "@/lib/api";

interface Category { id: number; name: string; slug: string; }
interface Size { id: number; label: string; }
interface Unit { id: number; name: string; abbreviation: string; }
interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_name: string;
  image: string | null;
  status: string;
}
interface ProductDetail extends Product {
  description: string;
  available_sizes: Size[];
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
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Suggest Product modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sizeSearch, setSizeSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Product detail modal
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Suggest size (inside detail modal)
  const [showSizeForm, setShowSizeForm] = useState(false);
  const [sizeForm, setSizeForm] = useState({ value: "", unit: "" });
  const [newUnit, setNewUnit] = useState(false);
  const [newUnitForm, setNewUnitForm] = useState({ name: "", abbreviation: "" });
  const [sizeNote, setSizeNote] = useState("");
  const [sizeSubmitting, setSizeSubmitting] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const [sizeSuccess, setSizeSuccess] = useState(false);

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
    (unitsApi.list() as Promise<{ results?: Unit[] } | Unit[]>)
      .then(d => setUnits((d as { results?: Unit[] }).results ?? (d as Unit[])))
      .catch(() => {});
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // --- Suggest Product ---
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
    setSubmitting(true); setError("");
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
    } finally { setSubmitting(false); }
  };

  const filteredSizes = sizes.filter(s => s.label.toLowerCase().includes(sizeSearch.toLowerCase()));

  // --- Product Detail ---
  const openDetail = async (p: Product) => {
    setDetail(null);
    setShowSizeForm(false);
    setSizeForm({ value: "", unit: "" });
    setNewUnit(false);
    setNewUnitForm({ name: "", abbreviation: "" });
    setSizeNote(""); setSizeError(""); setSizeSuccess(false);
    setLoadingDetail(true);
    try {
      const d = await productsApi.get(p.slug) as ProductDetail;
      setDetail(d);
    } catch { /* ignore */ }
    finally { setLoadingDetail(false); }
  };

  // --- Suggest Size ---
  const handleSuggestSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeForm.value) { setSizeError("Amount is required"); return; }
    if (!newUnit && !sizeForm.unit) { setSizeError("Select a unit or add a new one"); return; }
    if (newUnit && (!newUnitForm.name || !newUnitForm.abbreviation)) { setSizeError("Unit name and abbreviation are required"); return; }
    if (!detail) return;
    setSizeSubmitting(true); setSizeError("");
    try {
      let unitId = parseInt(sizeForm.unit);
      if (newUnit) {
        const created = await unitsApi.create(newUnitForm) as { id: number };
        unitId = created.id;
        // Add to local list so it shows next time
        setUnits(prev => [...prev, { id: created.id, ...newUnitForm }]);
      }
      await vendorProductsApi.suggestSize(detail.slug, {
        product: detail.id,
        value: sizeForm.value,
        unit: unitId,
        note: sizeNote,
      });
      setSizeSuccess(true);
      setShowSizeForm(false);
      setSizeForm({ value: "", unit: "" });
      setNewUnit(false);
      setNewUnitForm({ name: "", abbreviation: "" });
      setSizeNote("");
    } catch (err: unknown) {
      setSizeError(err instanceof Error ? err.message : "Failed to submit");
    } finally { setSizeSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-milano font-bold text-black dark:text-white">Products</h1>
           <p className="text-muted-foreground">Manage your inventory and pricing.</p>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Browse the full product catalog on HowMuch. Click a product to see details.</p>
        </div>
        <Button onClick={openModal} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Suggest Product
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-status-warning" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white dark:bg-dark-panel rounded-xl border border-light-border dark:border-dark-border overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square bg-light-panel dark:bg-dark-elevated">
                         <Image 
                           src={product.image || product.imageUrl || 'https://via.placeholder.com/300'} 
                           alt={product.name}
                           fill
                           className="object-cover"
                         />
                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                             <button className="p-2 bg-white dark:bg-dark-panel rounded-full shadow-sm hover:bg-light-panel dark:hover:bg-dark-elevated text-foreground">
                                 <Edit2 className="w-4 h-4" />
                             </button>
                         </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-medium text-black dark:text-white truncate pr-4">{product.name}</h3>
                                <p className="text-xs text-muted-foreground">{product.category_name || product.category || 'Uncategorized'}</p>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                            <div>
                                <span className="text-lg font-bold text-black dark:text-white">₦{parseFloat(product.price).toLocaleString()}</span>
                                {product.previousPrice && (
                                    <span className="text-xs text-muted-foreground line-through ml-2">₦{parseFloat(product.previousPrice).toLocaleString()}</span>
                                )}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-md ${product.stock < 10 ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'}`}>
                                {product.stock} in stock
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Add New Card Placeholder */}
            <button className="bg-light-panel dark:bg-dark-elevated rounded-xl border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center gap-4 hover:border-primary dark:hover:border-accent hover:bg-white dark:hover:bg-dark-panel transition-colors aspect-square">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-panel flex items-center justify-center shadow-sm">
                    <Plus className="w-6 h-6 text-foreground" />
                </div>
                <span className="font-medium text-muted-foreground">Add New Product</span>
            </button>
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
            <button
              key={p.slug}
              onClick={() => openDetail(p)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-300 transition-all group text-left w-full"
            >
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
            </button>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {(loadingDetail || detail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              {showSizeForm && (
                <button onClick={() => setShowSizeForm(false)} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900 flex-1">
                {showSizeForm ? "Suggest a New Size" : (detail?.name ?? "Loading...")}
              </h2>
              <button onClick={() => { setDetail(null); setShowSizeForm(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : detail && !showSizeForm ? (
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Image */}
                {detail.image && (
                  <img src={detail.image} alt={detail.name} className="w-full h-48 object-cover rounded-xl" />
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{detail.category_name}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-mono">{detail.sku}</span>
                </div>

                {/* Description */}
                {detail.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{detail.description}</p>
                )}

                {/* Available Sizes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Sizes</h3>
                  {detail.available_sizes.length === 0 ? (
                    <p className="text-sm text-gray-400">No sizes defined yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detail.available_sizes.map(s => (
                        <span key={s.id} className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-3 py-1 rounded-full">
                          {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size suggestion success */}
                {sizeSuccess && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-sm">
                    <span className="text-green-500">✓</span>
                    Size suggestion submitted for review!
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => { setShowSizeForm(true); setSizeSuccess(false); setSizeError(""); }}
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Suggest a Size
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-600" onClick={() => setDetail(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : detail && showSizeForm ? (
              <form onSubmit={handleSuggestSize} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                <p className="text-sm text-gray-500">
                  Suggest a new size for <span className="font-semibold text-gray-800">{detail.name}</span>. An admin will review your request.
                </p>

                {sizeError && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{sizeError}</p>
                )}

                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-gray-700 font-medium text-sm">Amount *</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={sizeForm.value}
                      onChange={e => setSizeForm(f => ({ ...f, value: e.target.value }))}
                      placeholder="e.g. 25"
                      required
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-gray-700 font-medium text-sm">Unit *</Label>
                    {newUnit ? (
                      <div className="flex gap-2">
                        <Input
                          value={newUnitForm.name}
                          onChange={e => setNewUnitForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Kilogram"
                          className="border-gray-200 focus:border-green-500 focus:ring-green-500 flex-1"
                        />
                        <Input
                          value={newUnitForm.abbreviation}
                          onChange={e => setNewUnitForm(f => ({ ...f, abbreviation: e.target.value }))}
                          placeholder="kg"
                          className="border-gray-200 focus:border-green-500 focus:ring-green-500 w-16"
                        />
                      </div>
                    ) : (
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={sizeForm.unit}
                        onChange={e => setSizeForm(f => ({ ...f, unit: e.target.value }))}
                      >
                        <option value="">Select unit</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* New unit toggle */}
                <button
                  type="button"
                  onClick={() => { setNewUnit(v => !v); setSizeForm(f => ({ ...f, unit: "" })); setNewUnitForm({ name: "", abbreviation: "" }); }}
                  className="text-xs text-green-600 hover:text-green-700 underline underline-offset-2"
                >
                  {newUnit ? "← Choose an existing unit instead" : "+ Unit not listed? Add a new one"}
                </button>

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Note (optional)</Label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={sizeNote}
                    onChange={e => setSizeNote(e.target.value)}
                    placeholder="Why should this size be added?"
                  />
                </div>

                <div className="flex gap-3 pt-1 pb-2">
                  <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-600" onClick={() => setShowSizeForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={sizeSubmitting}>
                    {sizeSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit Request
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}

      {/* Suggest Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100">
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
                {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Product Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Long Grain Rice" required className="border-gray-200 focus:border-green-500 focus:ring-green-500" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Description</Label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Briefly describe the product" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Category *</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Available Sizes</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={sizeSearch} onChange={e => setSizeSearch(e.target.value)} placeholder="Search sizes..." className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" />
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

                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium text-sm">Product Image</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition-colors" onClick={() => fileRef.current?.click()}>
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

                <div className="flex gap-3 pt-1 pb-2">
                  <Button type="button" variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setShowModal(false)}>Cancel</Button>
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
