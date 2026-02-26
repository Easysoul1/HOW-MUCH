"use client";


import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, X, Upload, Loader2, ImageIcon, Trash2, Pencil, AlertCircle } from "lucide-react";
import { adminProductsApi, categoriesApi, sizesApi, unitsApi } from "@/lib/api";

interface Category { id: number; name: string; slug: string; }
interface Unit { id: number; name: string; abbreviation: string; }
interface Size { id: number; label: string; value: string; unit: Unit; }
interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: number;
  category_name: string;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  image: string | null;
  available_sizes: { id: number; label: string }[];
}

const STATUS_BADGE: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  REJECTED: "bg-red-50 text-red-600",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  sizes: [] as number[],
  is_active: true,
  is_featured: false,
  image: null as File | null,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const fileRef = useRef<HTMLInputElement>(null);

  // Size search + custom size
  const [sizeSearch, setSizeSearch] = useState("");
  const [newSizeValue, setNewSizeValue] = useState("");
  const [newSizeUnit, setNewSizeUnit] = useState("");
  const [addingSize, setAddingSize] = useState(false);

  const isEditing = !!editingSlug;

  const fetchProducts = async (q = search) => {
    setLoading(true);
    try {
      const data = await adminProductsApi.list({ search: q || undefined }) as { results?: Product[] } | Product[];
      setProducts((data as { results?: Product[] }).results ?? (data as Product[]));
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setImagePreview(null);
    setEditingSlug(null);
    setError("");
    setSizeSearch("");
    setNewSizeValue("");
    setNewSizeUnit("");
    setShowModal(true);
  };

  const openEdit = async (product: Product) => {
    setEditingSlug(product.slug);
    setError("");
    setSizeSearch("");
    setNewSizeValue("");
    setNewSizeUnit("");
    setShowModal(true);
    setLoadingEdit(true);
    try {
      const detail = await adminProductsApi.get(product.slug) as Product;
      setForm({
        name: detail.name,
        description: detail.description ?? "",
        category: String(detail.category),
        sizes: (detail.available_sizes ?? []).map((s: { id: number }) => s.id),
        is_active: detail.is_active,
        is_featured: detail.is_featured,
        image: null,
      });
      setImagePreview(detail.image ?? null);
    } catch {
      setError("Failed to load product details");
    } finally {
      setLoadingEdit(false);
    }
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
      fd.append("is_active", String(form.is_active));
      fd.append("is_featured", String(form.is_featured));
      form.sizes.forEach(id => fd.append("available_sizes", String(id)));
      if (form.image) fd.append("image", form.image);

      if (isEditing) {
        await adminProductsApi.update(editingSlug!, fd);
      } else {
        await adminProductsApi.create(fd);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminProductsApi.delete(slug);
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, image: file }));
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const toggleSize = (id: number) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(id) ? f.sizes.filter(s => s !== id) : [...f.sizes, id],
    }));
  };

  const handleAddSize = async () => {
    if (!newSizeValue || !newSizeUnit) return;
    setAddingSize(true);
    try {
      const created = await sizesApi.create({
        value: parseFloat(newSizeValue),
        unit_id: parseInt(newSizeUnit),
      }) as Size;
      setSizes(prev => [...prev, created]);
      setForm(f => ({ ...f, sizes: [...f.sizes, created.id] }));
      setNewSizeValue("");
      setNewSizeUnit("");
    } catch {
      // silently fail — backend validation will catch bad input
    } finally {
      setAddingSize(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} in catalog</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-gray-900">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchProducts(search)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
          <Button variant="link" className="ml-auto text-status-danger h-auto p-0" onClick={() => fetchProducts()}>Retry</Button>
        </div>
      )}


      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white border border-gray-200 rounded-xl">No products found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(p => (
                <tr key={p.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.slug, p.name)} className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingEdit ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-5 flex-1">
                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-gray-900 text-sm">Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Long Grain Rice"
                    required
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-gray-900 text-sm">Description</Label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional product description"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-gray-900 text-sm">Category *</Label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    required
                  >
                    <option value="" className="bg-white">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-white">{c.name}</option>)}
                  </select>
                </div>

                {/* Sizes */}
                <div className="space-y-1.5">
                  <Label className="text-gray-900 text-sm">Available Sizes</Label>
                  <p className="text-xs text-gray-500">Select all sizes this product comes in</p>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={sizeSearch}
                      onChange={e => setSizeSearch(e.target.value)}
                      placeholder="Search sizes..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Size list */}
                  <div className="max-h-32 overflow-y-auto bg-gray-50 border border-gray-200 rounded-md p-2 space-y-0.5">
                    {sizes
                      .filter(s => s.label.toLowerCase().includes(sizeSearch.toLowerCase()))
                      .map(s => (
                        <label key={s.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={form.sizes.includes(s.id)}
                            onChange={() => toggleSize(s.id)}
                            className="accent-green-500 w-3.5 h-3.5"
                          />
                          <span className="text-sm text-gray-900">{s.label}</span>
                        </label>
                      ))}
                    {sizes.filter(s => s.label.toLowerCase().includes(sizeSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-gray-500 px-2 py-2">No sizes match</p>
                    )}
                  </div>

                  {/* Add custom size */}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50 bg-opacity-50 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Add custom size</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newSizeValue}
                        onChange={e => setNewSizeValue(e.target.value)}
                        placeholder="Value (e.g. 5)"
                        min="0"
                        step="any"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-green-500"
                      />
                      <select
                        value={newSizeUnit}
                        onChange={e => setNewSizeUnit(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-green-500"
                      >
                        <option value="" className="bg-white">Unit</option>
                        {units.map(u => <option key={u.id} value={u.id} className="bg-white">{u.abbreviation} — {u.name}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSize}
                        disabled={!newSizeValue || !newSizeUnit || addingSize}
                        className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-gray-900 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        {addingSize ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="space-y-1.5">
                  <Label className="text-gray-900 text-sm">Product Image</Label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors bg-gray-50"
                    onClick={() => fileRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="mx-auto h-28 object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500 py-2">
                        <Upload className="w-6 h-6" />
                        <p className="text-sm">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Flags */}
                <div className="flex gap-6 py-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="accent-green-500 w-3.5 h-3.5"
                    />
                    <span className="text-sm font-medium text-gray-900">Active</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                      className="accent-green-500 w-3.5 h-3.5"
                    />
                    <span className="text-sm font-medium text-gray-900">Featured</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-1 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-900 hover:bg-gray-50"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-gray-900" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {isEditing ? "Save Changes" : "Create Product"}
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
