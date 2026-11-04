"use client";

import {
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";

export default function DashboardHeader({
  title = "Dashboard",
  subtitle = "Overview of products, orders and customers.",
  periodOptions = [],
  period,
  onPeriodChange,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Actions */}
        {/* <div className="flex w-full items-center gap-2 sm:w-auto">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-9 min-w-0 flex-1 text-sm sm:w-[140px] sm:flex-none">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>

            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: "outline",
                size: "icon",
              })}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>

              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>

      <Separator />
    </div>
  );
}