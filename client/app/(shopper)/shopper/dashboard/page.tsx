"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Loader2, ShoppingBag, TrendingUp, Clock, CheckCircle, Star, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/api";

interface DashboardStats {
  pool_requests: number;
  active_requests: number;
  completed_requests: number;
  total_earnings: string;
  average_rating: number;
  total_ratings: number;
  profile_status: string;
  is_available: boolean;
}

export default function ShopperDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/shoppers/dashboard/', true) as DashboardStats;
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={fetchDashboard} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!stats) return null;

  // Show pending/suspended notice
  if (stats.profile_status !== 'approved') {
    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold">Shopper Dashboard</h1>
        </motion.div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="font-semibold text-lg text-yellow-800">
              {stats.profile_status === 'pending' ? 'Application Pending' : 'Account Suspended'}
            </h2>
            <p className="text-yellow-700 mt-2">
              {stats.profile_status === 'pending' 
                ? 'Your shopper application is being reviewed. You will be notified once approved.'
                : 'Your shopper account has been suspended. Please contact support for more information.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Shopper Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Active requests, earnings, and performance.
        </p>
      </motion.div>

      {/* Availability toggle */}
      <Card className={`border-2 ${stats.is_available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">
              {stats.is_available ? 'You are available for requests' : 'You are currently offline'}
            </span>
          </div>
          <Link href="/shopper/settings" className="text-sm text-purple-600 hover:underline">
            Change
          </Link>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pool Requests</p>
            <p className="font-display text-2xl font-bold text-purple-600">{stats.pool_requests}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Active Requests</p>
            <p className="font-display text-2xl font-bold text-orange-500">{stats.active_requests}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="font-display text-2xl font-bold text-green-600">{stats.completed_requests}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="font-display text-2xl font-bold text-accent">{formatPrice(parseFloat(stats.total_earnings))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating */}
      {stats.total_ratings > 0 && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <div>
              <p className="font-display text-2xl font-bold">{stats.average_rating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">{stats.total_ratings} rating{stats.total_ratings !== 1 ? 's' : ''}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-5">
          <h3 className="font-display font-semibold">Quick Actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/shopper/requests">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Pool ({stats.pool_requests})
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shopper/my-requests">
                <CheckCircle className="w-4 h-4 mr-2" />
                My Requests ({stats.active_requests})
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shopper/earnings">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Earnings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
