"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Phone, MapPin, Calendar, AlertCircle, CheckCircle2, Navigation } from "lucide-react";
import { useLocation } from "@/lib/location";

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const { location, address: detectedAddress, loading: locationLoading, error: locationError, requestLocation } = useLocation();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Sync formData when user loads (handles page refresh)
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
      });
    }
  }, [user]);

  // Auto-fill address fields only when user explicitly clicked "Get Location"
  useEffect(() => {
    if (locationRequested && detectedAddress) {
      setFormData((prev) => ({
        ...prev,
        city: detectedAddress.city || prev.city,
        state: detectedAddress.state || prev.state,
        address: detectedAddress.address || prev.address,
      }));
      setLocationRequested(false);
      setLocationSuccess(true);
    }
  }, [detectedAddress, locationRequested]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authApi.updateProfile(formData);
      updateUser(response as any);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setLocationSuccess(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await authApi.changePassword(passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 flex items-start gap-3 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-status-success/10 border-status-success/20 text-status-success' 
            : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="flex-1">{message.text}</p>
        </div>
      )}

      {/* Profile Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              {/* Account Info */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-light-panel rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-foreground font-medium">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-light-panel rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Editable Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    disabled
                    className="pl-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setLocationRequested(true); requestLocation(); }}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation className="mr-2 h-4 w-4" />
                          Get Location
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {locationError && isEditing && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}
                {locationSuccess && isEditing && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Location detected — address fields updated.</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setLocationSuccess(false);
                      setFormData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        email: user?.email || '',
                        phone_number: user?.phone_number || '',
                        address: user?.address || '',
                        city: user?.city || '',
                        state: user?.state || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password</Label>
              <Input
                id="old_password"
                name="old_password"
                type="password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirm">Confirm New Password</Label>
              <Input
                id="new_password_confirm"
                name="new_password_confirm"
                type="password"
                value={passwordData.new_password_confirm}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
