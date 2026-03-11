import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        accent:
          "border-transparent bg-accent text-accent-foreground",
        verified:
          "border-transparent bg-accent/20 text-accent",
        outline: "border-current text-foreground",
        secondary:
          "border-transparent bg-light-panel text-muted",
        warning:
          "border-transparent bg-status-warning/20 text-status-warning",
        destructive:
          "border-transparent bg-status-danger/15 text-status-danger",
        success:
          "border-transparent bg-status-success/15 text-status-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
