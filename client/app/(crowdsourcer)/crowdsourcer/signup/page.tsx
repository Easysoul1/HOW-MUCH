"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MapPin, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "@/lib/location";

export default function CrowdSourcerSignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { location, address, loading: locationLoading, error: locationError, requestLocation } = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // Auto-fill address fields when location is detected
  useEffect(() => {
    if (address && !formData.city && !formData.state && !formData.address) {
      setFormData((prev) => ({
        ...prev,
        city: address.city || '',
        state: address.state || '',
        address: address.address || '',
      }));
    }
  }, [address, formData.city, formData.state, formData.address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: "CROWDSOURCER",
        phone_number: formData.phone,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        latitude: location?.latitude ? Number(location.latitude.toFixed(6)) : undefined,
        longitude: location?.longitude ? Number(location.longitude.toFixed(6)) : undefined,
      };
      
      await register(registrationData);
      router.push("/crowdsourcer/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-white"
            onClick={() => router.push("/signup")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Button>
        </div>

        <Card className="border-light-border shadow-depth-2 bg-white">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-500">
                  <MapPin className="w-5 h-5"/>
               </div>
               <CardTitle className="text-xl text-foreground">
                  Apply as a CrowdSourcer
               </CardTitle>
            </div>
            <CardDescription>
              Help us track real-market prices. Check prices, verify products, and earn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Location Status */}
            {locationLoading && (
              <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <p className="text-sm text-indigo-300">
                  Getting your location and address...
                </p>
              </div>
            )}
            {locationError && (
              <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-danger" />
                <div className="flex-1">
                  <p className="text-sm text-status-danger">{locationError}</p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-status-danger hover:text-red-400"
                    onClick={requestLocation}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            {location && address && (
              <div className="mb-4 p-3 bg-status-success/10 border border-status-success/20 rounded-lg flex items-start gap-2">
                <MapPin className="w-4 h-4 text-status-success mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-status-success">Location Detected!</p>
                  <p className="text-xs text-green-400/80 mt-1">
                    {address.city}, {address.state}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234..."
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City</Label>
                  <Input
                    id="city"
                    placeholder="Lagos"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground">State</Label>
                  <Input
                    id="state"
                    placeholder="Lagos"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Market Street"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-white border-light-border text-foreground"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white border-light-border text-foreground"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-status-danger text-center bg-status-danger/10 py-2 rounded-lg border border-status-danger/20">{error}</p>}

              <Button 
                type="submit" 
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  "Register as CrowdSourcer"
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have a CrowdSourcer account?{" "}
              <Link href="/crowdsourcer/login" className="text-indigo-400 font-medium hover:underline">
                Log in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
