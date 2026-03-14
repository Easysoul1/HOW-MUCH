"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, Clock, Zap } from "lucide-react";
import { integratorApi } from "@/lib/api";

export default function UsageAnalyticsPage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await integratorApi.myUsage();
        setUsage(data);
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Usage Analytics</h1>
        <p className="mt-1 text-gray-500">API calls and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{(usage?.total_requests || 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-500">Today</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {(usage?.requests_today || 0).toLocaleString()}
              <span className="text-sm font-normal text-gray-400"> / {(usage?.daily_limit || 0).toLocaleString()}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{usage?.avg_response_time_ms || 0}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily breakdown */}
      {usage?.daily_breakdown?.length > 0 && (
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Daily Requests (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage.daily_breakdown.map((day: any, i: number) => {
                const pct = usage.daily_limit > 0 
                  ? Math.min((day.count / usage.daily_limit) * 100, 100) 
                  : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-600 w-16 text-right">{day.count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(!usage || usage.total_requests === 0) && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No API usage yet. Start making requests to see analytics here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

