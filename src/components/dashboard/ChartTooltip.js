"use client";

/**
 * Themed replacement for Recharts' default tooltip.
 * Pass a `formatter` to control how each series value is displayed.
 */
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg shadow-black/20">
      {label && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold text-popover-foreground">
              {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}