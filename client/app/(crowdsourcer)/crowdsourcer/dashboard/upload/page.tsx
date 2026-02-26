"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Upload, AlertCircle, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function SubmitPricePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    price: "",
    market_name: "",
    notes: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Mock products for the dropdown (In reality, fetch from API)
  const products = [
    { id: "1", name: "Milo (500g)" },
    { id: "2", name: "Dangote Sugar (1kg)" },
    { id: "3", name: "Peak Milk (380g)" },
    { id: "4", name: "Golden Penny Spaghetti" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, product_id: value }));
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
      setImages((prev) => {
        const newImages = [...prev, ...droppedFiles];
        return newImages.slice(0, 5); // Limit to 5 images max
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => {
        const newImages = [...prev, ...selectedFiles];
        return newImages.slice(0, 5); // Limit to 5 images max
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      if (images.length < 4) {
        throw new Error("You must upload at least 4 proof images from different angles.");
      }

      const submissionData = new FormData();
      submissionData.append("product", formData.product_id);
      submissionData.append("price", formData.price.toString());
      submissionData.append("market_name", formData.market_name);
      submissionData.append("notes", formData.notes);

      images.forEach((file, index) => {
        submissionData.append(`proof_image_${index + 1}`, file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/crowdsource/prices/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type to multipart/form-data manually with fetch when using FormData
        },
        body: submissionData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to submit price. Please try again.");
      }

      setSuccess(true);
      setFormData({ product_id: "", price: "", market_name: "", notes: "" });
      setImages([]);
      
      // Redirect after showing success message shortly
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/crowdsourcer/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Submit Market Price</h1>
          <p className="text-muted-foreground">Help buyers find the best deals by sharing accurate prices from local markets.</p>
        </div>
      </div>

      <Card className="bg-dark-panel border-dark-border">
        <CardHeader>
          <CardTitle>Price Details</CardTitle>
          <CardDescription>Fill in the item and market details carefully.</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 p-4 bg-status-success/10 border border-status-success/20 rounded-lg text-status-success flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>Price submitted successfully! It is now pending admin approval.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg text-status-danger flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="product">Product</Label>
                <Select value={formData.product_id} onValueChange={handleSelectChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="2500"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="market_name">Market / Store Name</Label>
              <Input
                id="market_name"
                placeholder="e.g. Oyingbo Market, Tejuosho, Mama Nkechi Kiosk"
                required
                value={formData.market_name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Proof Images (REQUIRED: 4 - 5 Angles)</Label>
              <div 
                className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                  ${dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-dark-border hover:bg-white/5"}
                `}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <input 
                  id="image-upload" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${dragActive ? "bg-indigo-500/30" : "bg-indigo-500/20"}`}>
                  <Upload className={`w-6 h-6 ${dragActive ? "text-indigo-400" : "text-indigo-500"}`} />
                </div>
                <p className="text-sm font-medium">Click to select files or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">Upload at least 4 clear photos of the item & price tag (Max 5 files).</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-dark-border bg-dark-panel overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-status-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: 5 - images.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square rounded-lg border border-dashed border-dark-border bg-dark-panel flex items-center justify-center">
                      <span className="text-xs text-muted-foreground opacity-50">Empty</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any variations? e.g. 'Price varies by size, this is for the medium one.'"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/crowdsourcer/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Price"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
