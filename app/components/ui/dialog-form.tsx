import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DialogFormProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  showSubmit?: boolean;
  submitDisabled?: boolean;
  children: React.ReactNode;
}

export function DialogForm({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = false,
  showSubmit = true,
  submitDisabled = false,
  children,
}: DialogFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              ></Button>
            )}
            {showSubmit && (
              <Button type="submit" disabled={isSubmitting || submitDisabled}>
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
