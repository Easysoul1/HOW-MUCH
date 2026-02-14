"use client";

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
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} isAnimationActive animationDuration={600}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="stroke-muted-foreground/20"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatPrice(v).replace("NGN", "₦")}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={50}
          className="text-muted-foreground font-display"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border border-light-border bg-white px-3 py-2 shadow-lg dark:border-dark-border dark:bg-dark-panel">
                <p className="text-xs text-muted-foreground">{payload[0].payload.label || payload[0].payload.date}</p>
                <p className="font-display text-lg font-semibold text-accent">
                  {formatPrice(payload[0].value as number)}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.2}
          isAnimationActive
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
