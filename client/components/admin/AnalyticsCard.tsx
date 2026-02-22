import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  prefix?: string;
}

export function AnalyticsCard({
  title,
  value,
  change,
  trend = "neutral",
  prefix = "",
}: AnalyticsCardProps) {
  return (
    <Card className="bg-dark-panel border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {prefix}{value.toLocaleString()}
        </div>
        {change !== undefined && (
          <p className="text-xs flex items-center mt-1">
            <span
              className={cn(
                "flex items-center",
                trend === "up"
                  ? "text-status-success"
                  : trend === "down"
                  ? "text-status-danger"
                  : "text-muted-foreground"
              )}
            >
              {trend === "up" ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : trend === "down" ? (
                <ArrowDown className="w-3 h-3 mr-1" />
              ) : null}
              {Math.abs(change)}%
            </span>
            <span className="text-muted-foreground ml-2">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
