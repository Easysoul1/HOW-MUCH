"use client";

import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface DataPoint {
  date: string;
  price: number;
  label?: string;
}

interface PriceChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  color?: string;
}

export function PriceChart({
  data,
  height = 280,
  showGrid = true,
  color = "#00D084",
}: PriceChartProps) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="stroke-muted-foreground/15 dark:stroke-muted-foreground/20"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="text-caption text-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatPrice(v).replace("NGN", "₦")}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={50}
          className="font-numeric text-caption text-muted-foreground"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border border-light-border bg-white px-3 py-2.5 shadow-depth-2 dark:border-dark-border dark:bg-dark-panel dark:shadow-depth-2">
                <p className="text-caption text-muted-foreground">{payload[0].payload.label || payload[0].payload.date}</p>
                <p className="font-numeric text-display-sm font-semibold text-accent mt-0.5">
                  {formatPrice(payload[0].value as number)}
                </p>
              </div>
            );
          }}
          cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.4 }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive
          animationDuration={400}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
