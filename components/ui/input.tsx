// components/ui/input.tsx
"use client"  
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", value, onChange, ...props }, ref) => {
    // Only set value for non-file inputs
    const inputProps: any = {
      type,
      className: cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      onChange,
      ...props,
    };
    if (type !== "file") {
      inputProps.value = value == null ? "" : value;
    }
    return <input {...inputProps} />;
  }
);
Input.displayName = "Input"
export { Input }
