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
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
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
      
      // Check if user object is valid
      if (!user || !user.user_type) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Redirect based on user type
      if (user.user_type === 'VENDOR') {
        router.push('/vendor/dashboard');
      } else if (user.user_type === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message) {
        // Check for specific error patterns
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Enter your username or email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe123 or john@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-foreground font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
