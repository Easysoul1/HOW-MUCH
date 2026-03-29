"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, Camera, X, BadgeCheck } from "lucide-react";
import { vendorVerificationApi } from "@/lib/api";

interface VerificationStatus {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  id?: number;
  business_name?: string;
  nin?: string;
  store_address?: string;
  store_city?: string;
  store_state?: string;
  store_landmark?: string;
  store_image_1_url?: string;
  store_image_2_url?: string;
  store_image_3_url?: string;
  years_in_business?: number;
  products_sold?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

export default function VendorVerificationPage() {
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    nin: "",
    store_address: "",
    store_city: "",
    store_state: "",
    store_landmark: "",
    years_in_business: "",
    products_sold: "",
  });
  
  // Image state
  const [storeImages, setStoreImages] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await vendorVerificationApi.getStatus() as VerificationStatus;
      setVerification(data);
      
      // Pre-fill form if data exists
      if (data.status !== 'NOT_SUBMITTED') {
        setFormData({
          business_name: data.business_name || "",
          nin: data.nin || "",
          store_address: data.store_address || "",
          store_city: data.store_city || "",
          store_state: data.store_state || "",
          store_landmark: data.store_landmark || "",
          years_in_business: data.years_in_business?.toString() || "",
          products_sold: data.products_sold || "",
        });
        // Set existing image previews
        setImagePreviews([
          data.store_image_1_url || null,
          data.store_image_2_url || null,
          data.store_image_3_url || null,
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch verification status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...storeImages];
    newImages[index] = file;
    setStoreImages(newImages);
    
    const newPreviews = [...imagePreviews];
    if (file) {
      newPreviews[index] = URL.createObjectURL(file);
    } else {
      newPreviews[index] = null;
    }
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('business_name', formData.business_name);
      formDataObj.append('nin', formData.nin);
      formDataObj.append('store_address', formData.store_address);
      formDataObj.append('store_city', formData.store_city);
      formDataObj.append('store_state', formData.store_state);
      formDataObj.append('store_landmark', formData.store_landmark);
      formDataObj.append('years_in_business', formData.years_in_business || '0');
      formDataObj.append('products_sold', formData.products_sold);
      
      // Add images
      if (storeImages[0]) formDataObj.append('store_image_1', storeImages[0]);
      if (storeImages[1]) formDataObj.append('store_image_2', storeImages[1]);
      if (storeImages[2]) formDataObj.append('store_image_3', storeImages[2]);

      const isUpdate = verification?.status === 'REJECTED';
      const result = isUpdate 
        ? await vendorVerificationApi.update(formDataObj)
        : await vendorVerificationApi.submit(formDataObj);
      
      setVerification(result as VerificationStatus);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Approved state
  if (verification?.status === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BadgeCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Vendor</h2>
          <p className="text-gray-600 mb-2">
            Your business <strong>{verification.business_name}</strong> has been verified.
          </p>
          <p className="text-sm text-gray-500">
            Verified on {new Date(verification.reviewed_at!).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Pending state
  if (verification?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-600 mb-4">
            Your verification request for <strong>{verification.business_name}</strong> is being reviewed by our team.
          </p>
          <p className="text-sm text-gray-500">
            Submitted on {new Date(verification.submitted_at!).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Rejected state - show form with rejection reason
  const isRejected = verification?.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Verification</h1>
              <p className="text-sm text-gray-600">Verify your business to build buyer trust</p>
            </div>
          </div>
        </div>

        {/* Rejection Alert */}
        {isRejected && verification.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-red-800">Verification Rejected</p>
                <p className="text-sm text-red-700 mt-1">{verification.rejection_reason}</p>
                <p className="text-sm text-red-600 mt-2">Please update your information and resubmit.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business / Store Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  placeholder="Your store or business name"
                  className="bg-white border-gray-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIN (National Identification Number) <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.nin}
                  onChange={(e) => handleChange("nin", e.target.value)}
                  placeholder="11-digit NIN"
                  maxLength={11}
                  className="bg-white border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">Your 11-digit National Identification Number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.years_in_business}
                  onChange={(e) => handleChange("years_in_business", e.target.value)}
                  placeholder="e.g. 5"
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Products Sold
                </label>
                <Input
                  value={formData.products_sold}
                  onChange={(e) => handleChange("products_sold", e.target.value)}
                  placeholder="e.g. Rice, Beans, Garri"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Store Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.store_address}
                  onChange={(e) => handleChange("store_address", e.target.value)}
                  placeholder="Full street address of your store"
                  className="bg-white border-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.store_city}
                  onChange={(e) => handleChange("store_city", e.target.value)}
                  placeholder="City"
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.store_state}
                  onChange={(e) => handleChange("store_state", e.target.value)}
                  placeholder="State"
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Landmark
                </label>
                <Input
                  value={formData.store_landmark}
                  onChange={(e) => handleChange("store_landmark", e.target.value)}
                  placeholder="e.g. Opposite Main Market Gate"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Store Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Store Images</h2>
            <p className="text-sm text-gray-500 mb-4">Upload at least one image of your store</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Front View", required: true },
                { label: "Inside View", required: false },
                { label: "Products Display", required: false },
              ].map((img, index) => (
                <div key={index}>
                  <input
                    type="file"
                    ref={fileInputRefs[index]}
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  
                  {imagePreviews[index] ? (
                    <div className="relative">
                      <img
                        src={imagePreviews[index]!}
                        alt={img.label}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageChange(index, null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">{img.label}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs[index].current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">{img.label}</span>
                      {img.required && <span className="text-xs text-red-500">Required</span>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : isRejected ? (
                "Resubmit for Verification"
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
