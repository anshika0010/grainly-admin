"use client";

import { memo, useId } from "react";
import { Package, Users, ShoppingCart, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS = {
  package: Package,
  users: Users,
  cart: ShoppingCart,
  rupee: IndianRupee,
};

const ICON_STYLES = {
  package: {
    chip: "bg-amber-500/15 text-amber-600 group-hover:bg-amber-500/25 dark:text-amber-400",
    bar: "from-amber-500/70 via-amber-500/20 to-transparent",
    glow: "217, 119, 6",
  },
  users: {
    chip: "bg-violet-500/15 text-violet-600 group-hover:bg-violet-500/25 dark:text-violet-400",
    bar: "from-violet-500/70 via-violet-500/20 to-transparent",
    glow: "124, 58, 237",
  },
  cart: {
    chip: "bg-sky-500/15 text-sky-600 group-hover:bg-sky-500/25 dark:text-sky-400",
    bar: "from-sky-500/70 via-sky-500/20 to-transparent",
    glow: "2, 132, 199",
  },
  rupee: {
    chip: "bg-emerald-500/15 text-emerald-600 group-hover:bg-emerald-500/25 dark:text-emerald-400",
    bar: "from-emerald-500/70 via-emerald-500/20 to-transparent",
    glow: "5, 150, 105",
  },
};

function StatCard({ label, formattedValue, deltaLabel, trend, icon, sparkline, isLoading }) {
  const Icon = ICONS[icon] ?? Package;
  const style = ICON_STYLES[icon] ?? ICON_STYLES.package;
  const isUp = trend === "up";
  const gradientId = useId();
  const sparkData = sparkline.map((value, index) => ({ index, value }));
  const sparkColor = isUp ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)";

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/10">
      {/* Identity-colored top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${style.bar}`} />

      {/* Ambient tint that follows the card's identity color on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(140px circle at 24px 20px, rgba(${style.glow}, 0.12), transparent 70%)`,
        }}
      />

      <CardContent className="relative pt-4 sm:pt-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 sm:h-10 sm:w-10 ${style.chip}`}>
              <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                {formattedValue}
              </p>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {label}
              </p>
            </div>
          </div>

          {deltaLabel && (
            <span
              className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[10px] font-medium tabular-nums sm:px-2 sm:text-xs ${
                isUp
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {deltaLabel}
            </span>
          )}
        </div>

        <div className="mt-3 h-9 sm:h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(StatCard);