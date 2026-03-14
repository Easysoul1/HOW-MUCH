"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { integratorApi } from "@/lib/api";

interface ApiKeyData {
  id: number;
  masked_key: string;
  name: string;
  plan: string;
  daily_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  requests_today: number;
}

export default function APIKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const data = await integratorApi.myKeys();
        setKeys(data.results || data);
      } catch (err) {
        console.error("Failed to fetch keys:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
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
        <h1 className="font-display text-2xl font-bold">API Keys</h1>
        <p className="mt-1 text-gray-500">
          Your API keys for accessing the HowMuch API. Keep them secret.
        </p>
      </div>

      {keys.length === 0 ? (
        <Card className="border-gray-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Key className="w-12 h-12 text-gray-300" />
            <div className="text-center">
              <p className="text-gray-900 font-medium">No API keys yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Contact our sales team to get API access for your organization.
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
              <a href="mailto:sales@howmuch.ng">Contact Sales</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => (
            <Card key={k.id} className={`border-gray-200 bg-white ${!k.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold">{k.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{k.plan}</span>
                  </div>
                  <p className="font-mono text-sm text-gray-500 mt-1">{k.masked_key}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {k.daily_limit.toLocaleString()} requests/day · {k.requests_today} used today
                    {k.last_used_at && ` · Last used: ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need more keys or higher limits?</strong> Contact{" "}
              <a href="mailto:sales@howmuch.ng" className="underline">sales@howmuch.ng</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

