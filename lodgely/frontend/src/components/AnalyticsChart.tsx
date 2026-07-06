"use client";

import type { MonthlyRevenue } from "@/lib/types";

interface AnalyticsChartProps {
  data: MonthlyRevenue[];
  title?: string;
}

export function AnalyticsChart({ data, title = "Revenue Overview" }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-64">
        <p className="text-surface-500 text-sm">No revenue data available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-surface-500 mt-0.5">Last 6 months breakdown</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          Monthly Revenue
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end gap-3 h-48 mt-4">
        {data.map((item, idx) => {
          const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              {/* Value Label */}
              <span className="text-[10px] text-surface-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ${item.revenue.toLocaleString()}
              </span>

              {/* Bar */}
              <div className="w-full relative rounded-t-lg overflow-hidden bg-surface-800/50 flex-1 flex items-end">
                <div
                  className="w-full rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-600 to-brand-400 opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                </div>
              </div>

              {/* Month Label */}
              <span className="text-[10px] text-surface-500 font-medium mt-1">
                {item.month.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-surface-800/50 flex items-center justify-between">
        <span className="text-xs text-surface-500">Total (6 months)</span>
        <span className="text-sm font-bold text-white font-display">
          ₹{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
