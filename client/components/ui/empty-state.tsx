"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Intentional empty state: illustration slot, clear copy, next action.
 * Use where data is missing to avoid bland placeholders.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-light-border bg-light-panel/50 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground [animation-duration:0.28s] animate-in fade-in">
          {icon}
        </div>
      )}
      <h3 className="text-display-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
      {children}
    </div>
  );
}
