"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Upload, AlertCircle, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { crowdsourceApi, productsApi, sizesApi, unitsApi } from "@/lib/api";

interface PriceItem {
  id: string;
  product?: string;  // slug
  product_name?: string;
  size?: number;  // size ID
  size_value?: string;
  size_unit?: number;  // unit ID
  price: string;
  brand: string;
  isNewProduct: boolean;
  isNewSize: boolean;
}

interface Product {
  slug: string;
  name: string;
  available_sizes?: Array<{ id: number; label: string; }>;
}

interface Size {
  id: number;
  label: string;
  value: number;
  unit: { id: number; abbreviation: string; };
}

interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

export default function SubmitPricePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Location state
  const [location, setLocation] = useState({
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    address: "",
    city: "",
    state: "",
  });
  
  // Price items
  const [items, setItems] = useState<PriceItem[]>([{
    id: crypto.randomUUID(),
    price: "",
    brand: "",
    isNewProduct: false,
    isNewSize: false,
  }]);
  
  // Photo upload (store verification photos)
  const [storePhotos, setStorePhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Data for dropdowns
  const [products, setProducts] = useState<Product[]>([]);
  const [allSizes, setAllSizes] = useState<Size[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cloudinary config
  const CLOUDINARY_UPLOAD_PRESET = "howmuch_preset";
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhkccnvyn";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, unitsData] = await Promise.all([
          productsApi.list(),
          unitsApi.list()
        ]);
        
        const productsList = (productsData as any).results || productsData || [];
        const unitsList = (unitsData as any).results || unitsData || [];
        
        setProducts(productsList);
        setUnits(unitsList);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      price: "",
      brand: "",
      isNewProduct: false,
      isNewSize: false,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<PriceItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleProductChange = async (itemId: string, value: string) => {
    if (value === "new") {
      updateItem(itemId, { 
        isNewProduct: true, 
        product: undefined,
        product_name: "",
        size: undefined,
        isNewSize: false 
      });
    } else {
      const selectedProduct = products.find(p => p.slug === value);
      updateItem(itemId, { 
        isNewProduct: false, 
        product: value,
        product_name: undefined,
        size: undefined,
      });
      
      // Fetch product sizes
      if (selectedProduct) {
        try {
          const productDetail: any = await productsApi.get(value);
          if (productDetail.available_sizes) {
            // Store sizes for this specific product in item state
            updateItem(itemId, { 
              product: value,
              // We'll handle available sizes separately
            });
          }
        } catch (err) {
          console.error("Failed to fetch product sizes:", err);
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setStorePhotos((prev) => {
        const newPhotos = [...prev, ...droppedFiles];
        return newPhotos.slice(0, 3); // Limit to 3 photos
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setStorePhotos((prev) => {
        const newPhotos = [...prev, ...selectedFiles];
        return newPhotos.slice(0, 3);
      });
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setStorePhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const requestLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          reject(new Error("Unable to get your location. Please enable location access."));
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Step 1: Request location first
      const coords = await requestLocation();
      
      // Update location state with coordinates
      setLocation(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      // Step 2: Validation
      if (items.length === 0) {
        throw new Error("Please add at least one item.");
      }

      if (storePhotos.length < 1) {
        throw new Error("Please upload at least 1 store photo.");
      }

      if (!location.city || !location.state) {
        throw new Error("Please provide city and state.");
      }

      // Validate each item
      for (const item of items) {
        if (!item.isNewProduct && !item.product) {
          throw new Error("Please select a product for all items or choose 'New Product'.");
        }
        if (item.isNewProduct && !item.product_name) {
          throw new Error("Please enter product name for new products.");
        }
        if (!item.isNewSize && !item.size) {
          throw new Error("Please select a size for all items or choose 'New Size'.");
        }
        if (item.isNewSize && (!item.size_value || !item.size_unit)) {
          throw new Error("Please enter size value and unit for new sizes.");
        }
        if (!item.price || parseFloat(item.price) <= 0) {
          throw new Error("Please enter valid prices for all items.");
        }
      }

      // Step 3: Upload store photos to Cloudinary
      const photoUrls = await Promise.all(
        storePhotos.map(photo => uploadToCloudinary(photo))
      );

      // Step 4: Prepare submission data
      const submissionData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: location.address,
        city: location.city,
        state: location.state,
        photo_1: photoUrls[0],
        photo_2: photoUrls[1] || undefined,
        photo_3: photoUrls[2] || undefined,
        items: items.map(item => ({
          product: item.isNewProduct ? undefined : item.product,
          product_name: item.isNewProduct ? item.product_name : undefined,
          size: item.isNewSize ? undefined : item.size,
          size_value: item.isNewSize ? parseFloat(item.size_value!) : undefined,
          size_unit: item.isNewSize ? item.size_unit : undefined,
          price: parseFloat(item.price),
          brand: item.brand || undefined,
        })),
      };

      await crowdsourceApi.submitPrices(submissionData);

      setSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push("/crowdsourcer/dashboard");
      }, 2000);

    } catch (err: unknown) {
      console.error("Upload error:", err);
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProductSizes = (productSlug?: string): Array<{ id: number; label: string }> => {
    if (!productSlug) return [];
    const product = products.find(p => p.slug === productSlug);
    return product?.available_sizes || [];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/crowdsourcer/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Submit Market Prices</h1>
          <p className="text-muted-foreground">Submit multiple items from a store in one go.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>Prices submitted successfully! Pending admin approval.</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Store Location</CardTitle>
            <CardDescription>Your location will be requested when you submit. Please provide city and state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="address">Address/Market Name</Label>
                <Input
                  id="address"
                  placeholder="e.g. Oyingbo Market"
                  value={location.address}
                  onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Lagos"
                  required
                  value={location.city}
                  onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Lagos"
                  required
                  value={location.state}
                  onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Items */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Price Items</CardTitle>
              <CardDescription>Add all items you found at this store.</CardDescription>
            </div>
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg space-y-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">Item #{index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Product */}
                  <div className="space-y-2">
                    <Label>Product *</Label>
                    <Select
                      value={item.isNewProduct ? "new" : item.product}
                      onValueChange={(value) => handleProductChange(item.id, value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productsLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="new">➕ New Product</SelectItem>
                            {products.map(product => (
                              <SelectItem key={product.slug} value={product.slug}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {item.isNewProduct && (
                      <Input
                        placeholder="Enter new product name"
                        value={item.product_name || ""}
                        onChange={(e) => updateItem(item.id, { product_name: e.target.value })}
                        className="bg-white mt-2"
                      />
                    )}
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <Label>Size *</Label>
                    <Select
                      value={item.isNewSize ? "new" : item.size?.toString()}
                      onValueChange={(value) => {
                        if (value === "new") {
                          updateItem(item.id, { isNewSize: true, size: undefined });
                        } else {
                          updateItem(item.id, { isNewSize: false, size: parseInt(value) });
                        }
                      }}
                      disabled={!item.product && !item.isNewProduct}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">➕ New Size</SelectItem>
                        {getProductSizes(item.product).map((size: any) => (
                          <SelectItem key={size.id} value={size.id.toString()}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {item.isNewSize && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                          type="number"
                          placeholder="Value (e.g. 5)"
                          value={item.size_value || ""}
                          onChange={(e) => updateItem(item.id, { size_value: e.target.value })}
                          className="bg-white"
                          step="0.01"
                        />
                        <Select
                          value={item.size_unit?.toString()}
                          onValueChange={(value) => updateItem(item.id, { size_unit: parseInt(value) })}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.abbreviation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label>Price (₦) *</Label>
                    <Input
                      type="number"
                      placeholder="2500"
                      required
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <Label>Brand (Optional)</Label>
                    <Input
                      placeholder="e.g. Golden Penny"
                      value={item.brand}
                      onChange={(e) => updateItem(item.id, { brand: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Store Photos */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Store Verification Photos (1-3 Required)</CardTitle>
            <CardDescription>Upload photos of yourself at the store. Not product photos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                ${dragActive ? "border-green-600 bg-green-50" : "border-gray-200 hover:bg-gray-50"}
              `}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('store-photos')?.click()}
            >
              <input 
                id="store-photos" 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${dragActive ? "bg-green-100" : "bg-green-50"}`}>
                <Upload className={`w-6 h-6 ${dragActive ? "text-green-700" : "text-green-600"}`} />
              </div>
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">1-3 photos showing you at the store (Max 3 files)</p>
            </div>

            {storePhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {storePhotos.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg border border-gray-200 bg-white overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Store photo ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/crowdsourcer/dashboard">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit {items.length} {items.length === 1 ? "Item" : "Items"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
