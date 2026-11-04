"use client";

import {
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-md
          rounded-xl
          p-5
          sm:p-6
        "
      >
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-red-100
              "
            >
              <AlertTriangle
                className="h-5 w-5 text-red-600"
              />
            </div>

            <AlertDialogTitle
              className="
                min-w-0
                break-words
                pt-1
                text-base
                sm:text-lg
              "
            >
              {title}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription
            className="
              break-words
              pt-2
              text-sm
              leading-6
            "
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter
          className="
            mt-2
            flex-col-reverse
            gap-2
            sm:flex-row
            sm:justify-end
          "
        >
          <AlertDialogCancel
            disabled={loading}
            className="
              m-0
              w-full
              sm:w-auto
            "
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="
              m-0
              w-full
              bg-red-600
              hover:bg-red-700
              sm:w-auto
            "
          >
            {loading ? (
              <>
                <Loader2
                  className="
                    mr-2
                    h-4
                    w-4
                    animate-spin
                  "
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2
                  className="
                    mr-2
                    h-4
                    w-4
                  "
                />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}