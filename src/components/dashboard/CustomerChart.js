"use client";

import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ChartTooltip from "./ChartTooltip";

function CustomerChart({ data, period = "Monthly" }) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">

        
        <CardTitle className="text-sm font-semibold sm:text-base">
          Customer Statistics
        </CardTitle>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {period}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <div className="relative h-[180px] w-full sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={4}
                strokeWidth={0}
                isAnimationActive
                animationDuration={700}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} customers`} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{total.toLocaleString("en-IN")}</span>
            <span className="text-xs text-muted-foreground">Total Customers</span>
          </div>
        </div>

        <div className="mt-2 w-full space-y-2.5">
          {data.map((d) => {
            const percent = Math.round((d.value / total) * 100);
            return (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-foreground">
                  {d.value.toLocaleString("en-IN")}
                  <span className="ml-1.5 text-xs text-muted-foreground">({percent}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(CustomerChart);