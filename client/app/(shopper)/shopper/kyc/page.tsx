"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, CheckCircle, Clock, XCircle, AlertTriangle, 
  Upload, User, FileText, MapPin, Phone
} from "lucide-react";
import apiClient from "@/lib/api";

interface ShopperProfile {
  id: number;
  bio: string;
  experience: string;
  service_radius_km: number;
  status: string;
  is_available: boolean;
  user_phone: string;
  user_city: string;
  user_state: string;
  rejection_reason?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { 
    label: 'Pending Review', 
    color: 'text-yellow-700', 
    icon: Clock,
    bg: 'bg-yellow-50 border-yellow-200'
  },
  approved: { 
    label: 'Approved', 
    color: 'text-green-700', 
    icon: CheckCircle,
    bg: 'bg-green-50 border-green-200'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-700', 
    icon: XCircle,
    bg: 'bg-red-50 border-red-200'
  },
  suspended: { 
    label: 'Suspended', 
    color: 'text-gray-700', 
    icon: AlertTriangle,
    bg: 'bg-gray-50 border-gray-200'
  },
};

export default function ShopperKYCPage() {
  const [profile, setProfile] = useState<ShopperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

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
      setPhone(data.user_phone || '');
      setCity(data.user_city || '');
      setState(data.user_state || '');
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        // No profile yet, show application form
        setProfile(null);
      } else {
        setError(err?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Update shopper profile
      await apiClient.patch('/shoppers/profile/', {
        bio,
        experience,
        service_radius_km: serviceRadius,
      }, true);

      // Update user profile for phone/location
      await apiClient.patch('/users/me/', {
        phone_number: phone,
        city,
        state,
      }, true);

      await fetchProfile();
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

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">No Shopper Profile</h1>
        <p className="text-gray-600 mb-6">
          You need to apply to become a shopper first.
        </p>
        <Button onClick={() => window.location.href = '/dashboard/become-shopper'}>
          Apply to Become a Shopper
        </Button>
      </div>
    );
  }

  const config = STATUS_CONFIG[profile.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Verification Status</h1>
        <p className="mt-1 text-gray-500">Manage your shopper profile and verification</p>
      </motion.div>

      {/* Status Banner */}
      <Card className={`border ${config.bg}`}>
        <CardContent className="p-4 flex items-start gap-3">
          <StatusIcon className={`w-6 h-6 ${config.color} mt-0.5`} />
          <div>
            <p className={`font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-sm text-gray-600 mt-1">
              {profile.status === 'pending' && 'Your application is being reviewed. This usually takes 24-48 hours.'}
              {profile.status === 'approved' && 'You are verified! You can now accept shopping requests.'}
              {profile.status === 'rejected' && (profile.rejection_reason || 'Your application was not approved. You can update your profile and resubmit.')}
              {profile.status === 'suspended' && 'Your account has been suspended. Please contact support for more information.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="080XXXXXXXX"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Lagos"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Lagos"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Service Radius (km)</label>
              <input
                type="number"
                value={serviceRadius}
                onChange={e => setServiceRadius(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Profile Details
          </h3>

          <div>
            <label className="text-sm font-medium text-gray-700">About You</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell customers about yourself, your strengths, and why they should trust you..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <textarea
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe any relevant shopping or delivery experience..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ID Upload - Future feature */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-gray-400" />
            ID Verification
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">ID upload coming soon</p>
            <p className="text-xs text-gray-400 mt-1">
              Valid government-issued ID will be required for verification
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-purple-600 hover:bg-purple-700"
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

      {profile.status === 'rejected' && (
        <p className="text-sm text-center text-gray-500">
          After updating your profile, your application will be reviewed again.
        </p>
      )}
    </div>
  );
}
