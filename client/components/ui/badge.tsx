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
          "border-transparent bg-accent/20 text-accent dark:bg-accent/30 dark:text-accent",
        outline: "border-current text-foreground",
        secondary:
          "border-transparent bg-light-panel text-muted dark:bg-dark-elevated dark:text-muted-foreground",
        warning:
          "border-transparent bg-status-warning/20 text-status-warning dark:bg-status-warning/30 dark:text-status-warning",
        destructive:
          "border-transparent bg-status-danger/15 text-status-danger dark:bg-status-danger/20 dark:text-status-danger",
        success:
          "border-transparent bg-status-success/15 text-status-success dark:bg-status-success/20 dark:text-status-success",
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
