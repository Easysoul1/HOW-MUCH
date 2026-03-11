import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Server, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-gray-900">System Health</h1>
          <p className="text-gray-500">Monitor infrastructure status, database connectivity, and API latency.</p>
        </div>
        <Button variant="outline" className="text-gray-900 border-gray-200 hover:bg-white">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* API Server Status */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">API Server</CardTitle>
            <Server className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Uptime: 99.98% (42 days)
            </div>
            <p className="text-xs text-gray-500 mt-4">Current Latency: 42ms</p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">PostgreSQL Database</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Primary & Read Replica Synced
            </div>
            <p className="text-xs text-gray-500 mt-4">Active Connections: 128 / 500</p>
          </CardContent>
        </Card>

        {/* Background Workers */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Background Workers</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Processing Queue Normal
            </div>
            <p className="text-xs text-gray-500 mt-4">Pending Tasks: 0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 font-mono text-sm text-gray-900">
              <span>[INFO] Successfully refreshed cache for popular products</span>
              <span className="text-gray-500">Just now</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-status-warning/10 font-mono text-sm text-status-warning">
              <span>[WARN] High memory usage detected on worker proxy-1</span>
              <span className="text-status-warning/70">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 font-mono text-sm text-gray-900">
              <span>[INFO] DB backup completed successfully (4.2GB)</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
