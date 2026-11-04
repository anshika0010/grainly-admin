/**
 * Simple color-swatch legend shared by RevenueChart and CustomerChart.
 * items: [{ label, value?, color }]
 */
export default function ChartLegend({ items, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value != null && (
            <span className="font-medium text-foreground">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}