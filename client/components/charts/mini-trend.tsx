"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniTrendProps {
  data: number[];
  trend?: "up" | "down" | "flat";
  className?: string;
}

export function MiniTrend({ data, trend = "flat", className }: MiniTrendProps) {
  const chartData = data.map((value, i) => ({ value, index: i }));
  const stroke =
    trend === "up" ? "#00D084" : trend === "down" ? "#EF4444" : "#64748B";

  return (
    <div className={className} style={{ width: 64, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
