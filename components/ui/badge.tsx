import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-vault-700/40 bg-vault-200 px-2.5 py-0.5 text-xs font-semibold text-vault-950",
        className,
      )}
      {...props}
    />
  );
}
