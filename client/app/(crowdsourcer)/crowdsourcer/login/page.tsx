"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Loader2, AlertCircle, MapPin } from "lucide-react";

export default function CrowdSourcerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(username, password);
      
      if (!user || !user.user_type) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Ensure only crowdsourcers login here, or redirect appropriately
      if (user.user_type === 'CROWDSOURCER') {
        router.push('/crowdsourcer/dashboard');
      } else {
        // Option 1: Log them out and show error
        // Option 2: Redirect them to their actual dashboard
        if (user.user_type === 'VENDOR') router.push('/vendor/dashboard');
        else if (user.user_type === 'ADMIN') router.push('/admin');
        else router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('credentials') || err.message.includes('Invalid')) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('non_field_errors')) {
          errorMessage = err.message.split('non_field_errors:')[1]?.trim() || 'Invalid credentials.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-dark-panel border-dark-border shadow-depth-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">CrowdSourcer Login</CardTitle>
            <CardDescription>Welcome back! Enter your details to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe123 or john@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  className="bg-dark border-dark-border text-foreground focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="bg-dark border-dark-border text-foreground focus-visible:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="flex-1">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have a CrowdSourcer account?{" "}
              <Link href="/crowdsourcer/signup" className="text-indigo-400 font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
