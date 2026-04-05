"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { PriceChart } from "@/components/charts/price-chart";
import { Loader2, TrendingUp, Package, Star, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/api";

interface EarningsData {
  total_earnings: string;
  completed_requests: number;
  average_rating: number;
  total_ratings: number;
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const dashboardData = await apiClient.get('/shoppers/dashboard/', true) as any;
      setData({
        total_earnings: dashboardData.total_earnings || '0',
        completed_requests: dashboardData.completed_requests || 0,
        average_rating: dashboardData.average_rating || 0,
        total_ratings: dashboardData.total_ratings || 0,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load earnings');
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
      </div>
    );
  }

  const earnings = parseFloat(data?.total_earnings || '0');

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Earnings</h1>
        <p className="mt-1 text-gray-500">
          Your shopper fees and performance stats
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="font-display text-2xl font-bold text-green-600">
                  {formatPrice(earnings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Requests</p>
                <p className="font-display text-2xl font-bold text-purple-600">
                  {data?.completed_requests || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="font-display text-2xl font-bold text-yellow-600">
                    {(data?.average_rating || 0).toFixed(1)}
                  </p>
                  <span className="text-sm text-gray-400">
                    ({data?.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings per request breakdown */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.completed_requests && data.completed_requests > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Average per request</span>
                <span className="font-semibold">
                  {formatPrice(earnings / data.completed_requests)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Total completed</span>
                <span className="font-semibold">{data.completed_requests} requests</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700 font-medium">Total earnings</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatPrice(earnings)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Complete your first request to see earnings</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
