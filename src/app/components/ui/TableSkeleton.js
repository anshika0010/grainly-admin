import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton({
  rows = 6,
  columns = 7,
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Table Header */}
      <div
        className="grid gap-4 border-b bg-slate-50 p-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-4 border-b p-4 last:border-b-0"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}