"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import apiClient from "@/lib/api";

interface ShopperProfile {
  id: number;
  bio: string;
  experience: string;
  service_radius_km: number;
  is_available: boolean;
  status: string;
}

export default function ShopperSettingsPage() {
  const [profile, setProfile] = useState<ShopperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/shoppers/profile/', true) as ShopperProfile;
      setProfile(data);
      setBio(data.bio || '');
      setExperience(data.experience || '');
      setServiceRadius(data.service_radius_km || 10);
      setIsAvailable(data.is_available);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await apiClient.patch('/shoppers/profile/', {
        bio,
        experience,
        service_radius_km: serviceRadius,
        is_available: isAvailable,
      }, true) as ShopperProfile;
      
      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={fetchProfile} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your shopper profile and availability</p>
      </motion.div>

      {/* Status banner */}
      {profile && profile.status !== 'approved' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                {profile.status === 'pending' ? 'Application Pending' : 'Account Suspended'}
              </p>
              <p className="text-sm text-yellow-700">
                {profile.status === 'pending'
                  ? 'Your application is being reviewed.'
                  : 'Please contact support for more information.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accept new requests</p>
              <p className="text-xs text-gray-400">
                When off, you won't appear in the shopper pool
              </p>
            </div>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Profile Information</h3>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell customers about yourself..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <textarea
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your shopping experience..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Service Radius (km)</label>
            <input
              type="number"
              value={serviceRadius}
              onChange={e => setServiceRadius(parseInt(e.target.value) || 10)}
              min={1}
              max={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">How far you're willing to travel for deliveries</p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        
        {success && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Saved!
          </span>
        )}
        
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    </div>
  );
}
