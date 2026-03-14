"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Key, Plus, Ban, BarChart3, Loader2, Copy, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiKeysApi } from "@/lib/api";

interface ApiKey {
  id: number;
  key: string;
  masked_key: string;
  name: string;
  owner_email: string;
  owner: number;
  plan: string;
  daily_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  requests_today: number;
}

export default function AdminApiKeysPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPlan, setFormPlan] = useState("BASIC");
  const [formDailyLimit, setFormDailyLimit] = useState("10000");
  const [showPassword, setShowPassword] = useState(false);

  // Usage modal
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_type !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    try {
      const data = await apiKeysApi.list();
      setKeys(data.results || data);
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const result = await apiKeysApi.create({
        name: formName,
        email: formEmail,
        password: formPassword,
        company_name: formCompany,
        plan: formPlan,
        daily_limit: parseInt(formDailyLimit),
      });
      setNewKeyRevealed(result.key);
      fetchKeys();
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormCompany("");
      setFormPlan("BASIC");
      setFormDailyLimit("10000");
    } catch (err: any) {
      setError(err.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: number) => {
    if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) return;
    try {
      await apiKeysApi.revoke(keyId);
      fetchKeys();
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const handleViewUsage = async (keyId: number) => {
    setUsageOpen(true);
    setUsageLoading(true);
    try {
      const data = await apiKeysApi.usage(keyId);
      setUsageData(data);
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setUsageLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">Manage 3rd party API access keys</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create API Key
        </Button>
      </div>

      {/* Revealed key alert */}
      {newKeyRevealed && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-yellow-800">New API Key Created — Copy it now!</p>
                <p className="text-sm text-yellow-700">This is the only time you'll see the full key.</p>
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

      {/* Keys list */}
      {keys.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No API keys yet. Create one for an integrator.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <Card key={k.id} className={`bg-white border-gray-200 ${!k.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <p className="font-display font-semibold text-gray-900">{k.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {k.plan}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-gray-500 mt-1">{k.masked_key}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Owner: {k.owner_email} · Limit: {k.daily_limit.toLocaleString()}/day · Today: {k.requests_today} requests
                    {k.last_used_at && ` · Last used: ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewUsage(k.id)}>
                    <BarChart3 className="w-4 h-4 mr-1" /> Usage
                  </Button>
                  {k.is_active && (
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRevoke(k.id)}>
                      <Ban className="w-4 h-4 mr-1" /> Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>Create a new API key for an integrator after payment confirmation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="integrator@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
              <p className="text-xs text-gray-400">If an integrator with this email already exists, the key will be added to their account.</p>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required minLength={8} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="Company or organization name" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input placeholder="e.g. Production, Staging" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={formPlan} onValueChange={setFormPlan}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Request Limit</Label>
              <Input type="number" value={formDailyLimit} onChange={(e) => setFormDailyLimit(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-green-600 hover:bg-green-700 text-white">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Generate Key
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Usage Dialog */}
      <Dialog open={usageOpen} onOpenChange={setUsageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>API Usage</DialogTitle>
          </DialogHeader>
          {usageLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : usageData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{usageData.total_requests?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{usageData.requests_today?.toLocaleString()} / {usageData.daily_limit?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{usageData.avg_response_time_ms}ms</p>
                </div>
              </div>
              {usageData.top_endpoints?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Top Endpoints</p>
                  <div className="space-y-1">
                    {usageData.top_endpoints.map((ep: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <code className="text-gray-600">{ep.endpoint}</code>
                        <span className="text-gray-500">{ep.count} calls</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No usage data available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
