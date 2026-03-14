"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function VendorKycPage() {
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_registration_number: "",
    tax_id: "",
    business_address: "",
    city: "",
    state: "",
    phone: "",
    business_email: "",
    website: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission (no actual verification)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your business information has been submitted for review. We'll notify you once verification is complete.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            Update Information
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
              <p className="text-sm text-gray-600">Submit your business information for verification</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  placeholder="Enter your registered business name"
                  className="bg-white border-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.business_type}
                  onChange={(e) => handleChange("business_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited_liability">Limited Liability Company</option>
                  <option value="corporation">Corporation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.business_registration_number}
                  onChange={(e) => handleChange("business_registration_number", e.target.value)}
                  placeholder="CAC/BN number"
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / TIN
                </label>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => handleChange("tax_id", e.target.value)}
                  placeholder="Tax identification number"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.business_address}
                  onChange={(e) => handleChange("business_address", e.target.value)}
                  placeholder="Full street address"
                  className="bg-white border-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
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
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="State"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="email"
                  value={formData.business_email}
                  onChange={(e) => handleChange("business_email", e.target.value)}
                  placeholder="contact@business.com"
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.bank_name}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                  placeholder="Bank name"
                  className="bg-white border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.account_number}
                  onChange={(e) => handleChange("account_number", e.target.value)}
                  placeholder="10 digits"
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.account_name}
                  onChange={(e) => handleChange("account_name", e.target.value)}
                  placeholder="Account name"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads (Placeholder) */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h2>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">CAC Certificate / Business Registration</p>
                <p className="text-xs text-gray-500 mt-1">(Upload functionality coming soon)</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Valid ID (Director/Owner)</p>
                <p className="text-xs text-gray-500 mt-1">(Upload functionality coming soon)</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Proof of Address (Utility Bill)</p>
                <p className="text-xs text-gray-500 mt-1">(Upload functionality coming soon)</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Note: Actual document verification will be implemented in a future update.
              This form currently saves your information for admin review.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
