"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Key, Plus, Copy, Check, Loader2, AlertCircle } from "lucide-react";
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

const PLAN_KEY_LIMITS: Record<string, number> = {
  BASIC: 2,
  PRO: 5,
  ENTERPRISE: 10,
};

export default function APIKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [error, setError] = useState("");
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

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

  const activeKeys = keys.filter((k) => k.is_active);
  const currentPlan = activeKeys[0]?.plan || "BASIC";
  const maxKeys = PLAN_KEY_LIMITS[currentPlan] || 2;
  const canCreateMore = activeKeys.length < maxKeys;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const result = await integratorApi.createKey(keyName);
      setNewKeyRevealed(result.key);
      setCreateOpen(false);
      setKeyName("");
      fetchKeys();
    } catch (err: any) {
      setError(err.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">API Keys</h1>
          <p className="mt-1 text-gray-500">
            Your API keys for accessing the HowMuch API. Keep them secret.
          </p>
        </div>
        {keys.length > 0 && (
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={!canCreateMore}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> New Key
          </Button>
        )}
      </div>

      {/* Plan info */}
      {keys.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{currentPlan} Plan</span>
          <span className="text-gray-500">
            {activeKeys.length} / {maxKeys} keys used
          </span>
          {!canCreateMore && (
            <span className="text-amber-600 text-xs">
              Key limit reached.{" "}
              <a href="mailto:sales@howmuch.ng" className="underline">Upgrade plan</a>
            </span>
          )}
        </div>
      )}

      {/* Revealed key alert */}
      {newKeyRevealed && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-yellow-800">New API Key Created — Copy it now!</p>
                <p className="text-sm text-yellow-700">This is the only time you&apos;ll see the full key.</p>
                <div className="flex items-center gap-2 bg-white border border-yellow-200 rounded p-2">
                  <code className="text-sm font-mono flex-1 break-all">{newKeyRevealed}</code>
                  <Button size="sm" variant="outline" onClick={() => copyKey(newKeyRevealed)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setNewKeyRevealed(null)} className="text-yellow-700">
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="border-gray-200 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Key className="w-12 h-12 text-gray-300" />
            <div className="text-center">
              <p className="text-gray-900 font-medium">No API keys yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Your account has been set up. Contact our team if you need assistance.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Generate Your First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => (
            <Card key={k.id} className={`border-gray-200 bg-white ${!k.is_active ? "opacity-60" : ""}`}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold">{k.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        k.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {k.is_active ? "Active" : "Revoked"}
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
              <strong>Need higher limits or enterprise features?</strong> Contact{" "}
              <a href="mailto:sales@howmuch.ng" className="underline">sales@howmuch.ng</a>.
            </p>
          </div>
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Give your key a name to identify it (e.g. &quot;Production&quot;, &quot;Staging&quot;).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                placeholder="e.g. Production"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="bg-green-600 hover:bg-green-700 text-white">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Generate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

