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
          "border-transparent bg-accent/20 text-accent dark:bg-accent-muted",
        outline: "border-current text-foreground",
        secondary:
          "border-transparent bg-light-panel text-muted dark:bg-dark-elevated dark:text-muted-foreground",
        warning:
          "border-transparent bg-amber-highlight/20 text-amber-highlight dark:bg-amber-muted",
        destructive:
          "border-transparent bg-red-500/15 text-red-600 dark:text-red-400",
        success:
          "border-transparent bg-accent/15 text-accent",
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
