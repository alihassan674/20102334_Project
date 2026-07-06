import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: "brand" | "emerald" | "amber" | "rose";
}

const accentStyles = {
  brand: {
    iconBg: "bg-brand-500/10",
    iconColor: "text-brand-400",
    trendColor: "text-brand-400",
    glow: "shadow-brand-500/5",
    border: "border-brand-500/10",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    trendColor: "text-emerald-400",
    glow: "shadow-emerald-500/5",
    border: "border-emerald-500/10",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    trendColor: "text-amber-400",
    glow: "shadow-amber-500/5",
    border: "border-amber-500/10",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
    trendColor: "text-rose-400",
    glow: "shadow-rose-500/5",
    border: "border-rose-500/10",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "brand",
}: StatCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div
      className={`stat-card glass-card rounded-2xl p-5 ${styles.border} hover:${styles.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${styles.iconBg}`}
        >
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${styles.iconBg} ${styles.trendColor}`}
          >
            <span>{trend.value > 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-display font-bold text-white tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-surface-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
