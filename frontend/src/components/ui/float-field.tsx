import * as React from "react";
import { cn } from "@/lib/utils";

export type FloatFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & { label: string; id: string };

/** Input with a label that floats up on focus or when filled. Works with react-hook-form's register(). */
export const FloatField = React.forwardRef<HTMLInputElement, FloatFieldProps>(({ label, id, className, ...props }, ref) => (
  <div className="relative">
    <input
      id={id}
      ref={ref}
      placeholder=" "
      className={cn(
        "peer flex h-12 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-3 top-1.5 origin-left text-xs text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary"
    >
      {label}
    </label>
  </div>
));
FloatField.displayName = "FloatField";
