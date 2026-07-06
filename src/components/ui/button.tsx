import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
    const vCls = {
      primary:
        "bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus:ring-brand-500",
      secondary:
        "bg-white text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50 focus:ring-brand-500",
      ghost: "text-ink-700 hover:bg-ink-50",
    }[variant];
    return (
      <button
        ref={ref}
        className={cn(base, sizeClasses[size], vCls, className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
