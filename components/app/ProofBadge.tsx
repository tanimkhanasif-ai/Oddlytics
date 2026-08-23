import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProofBadge({
  className,
  label = "verified by Proof",
  iconOnly = false,
}: {
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}
    >
      <BadgeCheck className="h-4 w-4 shrink-0 text-proof drop-shadow-[0_0_8px_var(--proof)]" />
      {!iconOnly && <span>{label}</span>}
    </span>
  );
}
