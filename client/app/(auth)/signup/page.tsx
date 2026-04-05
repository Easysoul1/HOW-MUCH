"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Store, ShoppingBag, ArrowLeft, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useLocation } from "@/lib/location";

type Role = "buyer" | "vendor" | null;

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const {
    location,
    address,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useLocation();

  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState<"role-selection" | "form">("role-selection");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    password: "",
    confirmPassword: "",
    businessName: "",
  });

  const [error, setError] = useState("");

  // Auto-fill address fields when location is detected (only if fields are empty)
  useEffect(() => {
    if (address && !formData.city && !formData.state && !formData.address) {
      setFormData((prev) => ({
        ...prev,
        city: address.city || "",
        state: address.state || "",
        address: address.address || "",
      }));
    }
  }, [address, formData.city, formData.state, formData.address]);

  // Request location when form step loads (optional)
  useEffect(() => {
    if (step === "form" && !location && !locationError) {
      requestLocation();
    }
  }, [step, location, locationError, requestLocation]);

  const handleRoleSelect = (selectedRole: "buyer" | "vendor") => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleBack = () => {
    setStep("role-selection");
    setRole(null);
    setError("");
  };

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
      // Map role to backend user_type
      const userType = role === "vendor" ? "VENDOR" : "CUSTOMER";

      const registrationData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: userType,
        phone_number: formData.phone,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        // Round coordinates to 6 decimal places (backend constraint: max_digits=9, decimal_places=6)
        latitude: location?.latitude
          ? Number(location.latitude.toFixed(6))
          : undefined,
        longitude: location?.longitude
          ? Number(location.longitude.toFixed(6))
          : undefined,
      };

      console.log("Registration data:", registrationData);

      await register(registrationData);

      // Redirect based on role
      if (role === "vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/dashboard");
      }
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {step === "role-selection" ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Join HowMuch
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose how you want to use the platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
              {/* Buyer Card */}
              <button
                onClick={() => handleRoleSelect("buyer")}
                className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-transparent bg-white shadow-depth-1 hover:shadow-depth-3 hover:border-black/5 transition-all duration-300 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <div className="h-20 w-20 rounded-full bg-status-info/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-10 h-10 text-status-info" />
                </div>
                <h2 className="text-2xl font-bold mb-3">I am a Buyer</h2>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Discover fair prices, track market trends, and make informed
                  grocery decisions.
                </p>
                <div className="mt-8 px-6 py-2 rounded-full bg-light-panel text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Join as Buyer
                </div>
              </button>

              {/* Vendor Card */}
              <button
                onClick={() => handleRoleSelect("vendor")}
                className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-transparent bg-white shadow-depth-1 hover:shadow-depth-3 hover:border-black/5 transition-all duration-300 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-accent/15 text-accent text-xs font-bold rounded-full">
                  GROWTH
                </div>
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Store className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-3">I am a Vendor</h2>
                <p className="text-center text-muted-foreground leading-relaxed">
                  List your products, reach more customers, and manage your
                  store inventory.
                </p>
                <div className="mt-8 px-6 py-2 rounded-full bg-light-panel text-sm font-medium group-hover:bg-brand group-hover:text-white transition-colors">
                  Become a Vendor
                </div>
              </button>

            </div>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-xl mx-auto"
          >
            <Button
              variant="ghost"
              className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Role
            </Button>

            <Card className="border-light-border shadow-depth-2">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      role === "vendor"
                        ? "bg-accent/15 text-accent"
                        : "bg-status-info/15 text-status-info",
                    )}
                  >
                    {role === "vendor" ? (
                      <Store className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    Sign up as{" "}
                    {role === "vendor"
                      ? "Vendor"
                      : "Buyer"}
                  </CardTitle>
                </div>
                <CardDescription>
                  Enter your details to create your {role} account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Location Status */}
                {locationLoading && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-700">
                      Getting your location and address...
                    </p>
                  </div>
                )}
                {locationError && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-700">{locationError}</p>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs text-amber-700"
                        onClick={requestLocation}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
                {location && address && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-700">
                          Location Detected!
                        </p>
                        <p className="text-xs text-status-success mt-1">
                          {address.city}, {address.state}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {role === "vendor" && (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Mama Nkechi Stores"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        className="border-status-success/30 focus:ring-status-success/80"
                      />
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+234..."
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Lagos"
                        required
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Lagos"
                        required
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Market Street"
                      required
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-status-danger text-center bg-status-danger/10 py-2 rounded-lg border border-status-danger/20">{error}</p>}

                  <Button
                    type="submit"
                    className={cn(
                      "w-full text-white",
                      role === "vendor"
                        ? "bg-brand hover:bg-brand/90"
                        : "bg-black hover:bg-black/90",
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating {role} account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
