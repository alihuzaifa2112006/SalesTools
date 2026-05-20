"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#171717", "#525252", "#737373", "#a3a3a3", "#d4d4d4", "#e5e5e5"];

interface SalesChartProps {
  data: { month: string; revenue: number; leads: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#a3a3a3", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#a3a3a3", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="revenue" fill="#171717" radius={[6, 6, 0, 0]} name="Revenue" />
        <Bar dataKey="leads" fill="#d4d4d4" radius={[6, 6, 0, 0]} name="Leads" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SourceChartProps {
  data: { source: string; count: number }[];
}

export function SourceChart({ data }: SourceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-neutral-400">
        No lead source data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="count"
          nameKey="source"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
