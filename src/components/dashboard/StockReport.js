"use client"

import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUS_CONFIG = {
  out: { label: "Out of stock", badge: "destructive", bar: "[&>div]:bg-red-500" },
  low: { label: "Low stock", badge: "outline", bar: "[&>div]:bg-amber-500" },
  high: { label: "In stock", badge: "secondary", bar: "[&>div]:bg-emerald-500" },
};

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function StockReport({ items }) {

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Recent Order</CardTitle>
        <a href="/admin/ecommerce/orders" className="text-xs font-medium text-primary hover:underline">
          View All
        </a>
      </CardHeader>

      <CardContent className="p-0">
  <ScrollArea className="w-full">
    <Table className="min-w-[700px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">Order Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="pr-6">Price</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => {
          const status = STATUS_CONFIG[item.status];

          return (
            <TableRow key={item.id} className="group">
              {/* Order ID */}
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0 border border-border/60">
                    <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                      {initials(item.orderNumber)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium leading-tight text-foreground">
                      {item.orderNumber}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      #{item.id}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Customer Name */}
              <TableCell className="text-sm text-foreground">
                {item.user?.name || "N/A"}
              </TableCell>

              {/* Order Status */}
              <TableCell>
                <Badge
                  variant={status?.badge || "secondary"}
                  className="whitespace-nowrap text-[10px]"
                >
                  {status?.label || item.status}
                </Badge>
              </TableCell>

              {/* Payment Status */}
              <TableCell>
                <Badge
                  className={`whitespace-nowrap text-[10px] ${
                    item.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700 hover:bg-green-100":(item.paymentStatus === "partial_paid")?"bg-red-100 text-yellow-700 hover:bg-yellow-100": "bg-red-100 text-red-700 hover:bg-red-100"
                      
                  }`}
                >
                  {item.paymentStatus}
                </Badge>
              </TableCell>

              {/* Created Date */}
              <TableCell className="text-sm text-muted-foreground">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </TableCell>

              {/* Total Amount */}
              <TableCell className="pr-6 text-sm font-medium">
                ₹{Number(item.totalAmount || 0).toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </ScrollArea>
</CardContent>
    </Card>
  );
}