"use client";

import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ChartTooltip from "./ChartTooltip";
import ChartLegend from "./ChartLegend";

const formatCurrency = (value) => `\u20B9${Number(value).toLocaleString("en-IN")}`;
const formatCompact = (value) => `${Math.round(value / 1000)}k`;

const legendItems = [
  { label: "Revenue", color: "var(--chart-1, #8B1538)" },
  { label: "Cost of goods", color: "var(--chart-2, #D4A574)" },
];

function RevenueChart({ data, period = "Yearly" }) {
  return (
    <Card className="border-border/60 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Revenue Report</CardTitle>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {period}
        </span>
      </CardHeader>

      <CardContent>
        <ChartLegend items={legendItems} className="mb-4" />

        <div className="h-[220px] w-full sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={6}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={formatCompact}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "var(--primary)", opacity: 0.06 }}
              content={<ChartTooltip formatter={formatCurrency} />}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="var(--chart-1, #8B1538)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={700}
            />
            <Bar
              dataKey="cost"
              name="Cost of goods"
              fill="var(--chart-2, #D4A574)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={700}
              animationBegin={100}
            />
     </BarChart>
  </ResponsiveContainer>
</div>
      </CardContent>
    </Card>
  );
}

export default memo(RevenueChart);