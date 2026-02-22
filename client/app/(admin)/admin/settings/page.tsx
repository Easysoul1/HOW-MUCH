import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-medium text-white">Settings</h1>
        <p className="text-muted-foreground">Configure global system parameters.</p>
      </div>
      <Card className="bg-dark-panel border-dark-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
