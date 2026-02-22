import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Server, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-white">System Health</h1>
          <p className="text-muted-foreground">Monitor infrastructure status, database connectivity, and API latency.</p>
        </div>
        <Button variant="outline" className="text-white border-dark-border hover:bg-dark-panel">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* API Server Status */}
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">API Server</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Uptime: 99.98% (42 days)
            </div>
            <p className="text-xs text-muted-foreground mt-4">Current Latency: 42ms</p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">PostgreSQL Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Primary & Read Replica Synced
            </div>
            <p className="text-xs text-muted-foreground mt-4">Active Connections: 128 / 500</p>
          </CardContent>
        </Card>

        {/* Background Workers */}
        <Card className="bg-dark-panel border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Background Workers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Operational</div>
            <div className="flex items-center mt-2 gap-2 text-sm text-status-success">
               <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
               Processing Queue Normal
            </div>
            <p className="text-xs text-muted-foreground mt-4">Pending Tasks: 0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-dark-panel border-dark-border">
        <CardHeader>
          <CardTitle className="text-white">Recent System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-white/5 font-mono text-sm text-white">
              <span>[INFO] Successfully refreshed cache for popular products</span>
              <span className="text-muted-foreground">Just now</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-status-warning/10 font-mono text-sm text-status-warning">
              <span>[WARN] High memory usage detected on worker proxy-1</span>
              <span className="text-status-warning/70">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-white/5 font-mono text-sm text-white">
              <span>[INFO] DB backup completed successfully (4.2GB)</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
