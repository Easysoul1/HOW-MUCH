"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ShoppingBag, Star, DollarSign, Clock, ArrowRight, Upload, User } from "lucide-react";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";

export default function BecomeShopperPage() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [nin, setNin] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('experience', experience);
      formData.append('service_radius_km', serviceRadius.toString());
      formData.append('nin', nin);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      await apiClient.post('/shoppers/apply/', formData, true);
      
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
        <p className="text-gray-600 mb-6">
          We'll review your application and get back to you within 24-48 hours.
          You'll receive a notification once approved.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Shopper Application</h1>
          <p className="text-gray-500 mt-1">Tell us about yourself</p>
        </motion.div>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                About You <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell customers about yourself, your location, and why you'd be a great shopper..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Shopping Experience
              </label>
              <textarea
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Do you have any experience with grocery shopping, delivery services, or similar work?"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Service Radius (km)
              </label>
              <input
                type="number"
                value={serviceRadius}
                onChange={e => setServiceRadius(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum distance you're willing to travel for deliveries
              </p>
            </div>

            {/* KYC Fields */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Verification Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    NIN (National Identification Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nin}
                    onChange={e => setNin(e.target.value)}
                    maxLength={11}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your 11-digit NIN"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Profile Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    {photoPreview ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhoto(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <User className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload a clear photo of yourself for verification
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleApply}
                disabled={loading || !bio.trim() || !nin.trim() || !profilePhoto}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('info')}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Info step
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">Become a Personal Shopper</h1>
        <p className="text-gray-500 mt-1">
          Earn money by shopping for others in your area
        </p>
      </motion.div>

      {/* Benefits */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Earn Money</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Earn ₦50/item + ₦100/vendor on every order you complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Flexible Hours</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Work whenever you want. Set your availability on your terms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Simple Process</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Accept requests, shop the items, and deliver to customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Build Reputation</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Earn ratings and reviews to attract more customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-900">Apply & Get Approved</p>
                <p className="text-sm text-gray-500">Fill out the application form. We'll review and approve within 24-48 hours.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-900">Browse & Accept Requests</p>
                <p className="text-sm text-gray-500">See shopping requests in your area. Accept the ones that work for you.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <div>
                <p className="font-medium text-gray-900">Make Offers & Shop</p>
                <p className="text-sm text-gray-500">Send your price offer to the customer. Once accepted, shop the items.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
              <div>
                <p className="font-medium text-gray-900">Deliver & Get Paid</p>
                <p className="text-sm text-gray-500">Deliver the items and earn your service fee automatically.</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Button
        onClick={() => setStep('form')}
        className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
      >
        Apply Now
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
