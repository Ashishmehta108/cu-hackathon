import { Flash, People } from "iconsax-react";
import { cn } from "@/lib/utils";
import type { ComplaintCategory } from "@/lib/types";

const ACCENT_COLORS: Record<string, string> = {
  infrastructure: "border-blue-500/40 bg-blue-500/5",
  health: "border-red-500/40 bg-red-500/5",
  agriculture: "border-green-500/40 bg-green-500/5",
  water: "border-cyan-500/40 bg-cyan-500/5",
  education: "border-purple-500/40 bg-purple-500/5",
  corruption: "border-orange-500/40 bg-orange-500/5",
  other: "border-gray-500/40 bg-gray-500/5",
};

export function ComplaintCluster({
  count,
  category,
  className,
}: {
  count: number;
  category: ComplaintCategory;
  className?: string;
}) {
  if (count <= 1) return null;

  const accentClass = ACCENT_COLORS[category] ?? ACCENT_COLORS.other;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-4",
        accentClass,
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Flash className="h-5 w-5 text-primary" variant="Linear" color="currentColor" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <People className="h-4 w-4 text-muted-foreground" variant="Linear" color="currentColor" />
          <p className="text-sm font-semibold text-foreground">
            {count} people reported similar issues in your area
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your voice adds to the collective demand for action
        </p>
      </div>
    </div>
  );
}
