"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getAvatarColor } from "@/lib/avatarColor";

export default function CustomerViewDialog({
  open,
  onOpenChange,
  customer,
}) {
  if (!customer) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-full text-lg font-semibold text-white
              ${getAvatarColor(customer.name)}
            `}
          >
            {customer.name
              ?.charAt(0)
              ?.toUpperCase() || "?"}
          </div>

          <div className="min-w-0">
            <div className="truncate font-medium">
              {customer.name}
            </div>

            <div className="text-sm text-slate-400">
              ID #{customer.id}
            </div>
          </div>
        </div>

        <div className="space-y-0 text-sm">
          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 border-b py-2">
            <span className="text-slate-500">
              Email
            </span>

            <span className="break-all text-right">
              {customer.email || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 border-b py-2">
            <span className="text-slate-500">
              Phone
            </span>

            <span className="text-right">
              {customer.phone || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 border-b py-2">
            <span className="text-slate-500">
              Status
            </span>

            <span className="text-right">
              {customer.status
                ? "Activated"
                : "Deactivated"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 border-b py-2">
            <span className="text-slate-500">
              Is Vendor?
            </span>

            <span className="text-right">
              {customer.isVendor || "No"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 py-2">
            <span className="text-slate-500">
              Created
            </span>

            <span className="break-all text-right">
              {customer.createdAt || "—"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}