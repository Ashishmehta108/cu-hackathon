import { cn } from "@/lib/utils";
import type { ComplaintCategory, WikiCategory } from "@/lib/types";
import { CATEGORY_LABELS, WIKI_CATEGORY_LABELS } from "@/lib/types";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  infrastructure: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
  health: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
  agriculture: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/30" },
  water: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30" },
  education: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
  corruption: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/30" },
  other: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/30" },
  // Wiki categories mapped to closest complaint color
  farming: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/30" },
  water_management: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30" },
  natural_remedies: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
  history: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
  festivals: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/30" },
  crafts: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
};

export function CategoryBadge({
  category,
  type = "complaint",
  className,
}: {
  category: ComplaintCategory | WikiCategory;
  type?: "complaint" | "wiki";
  className?: string;
}) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
  const label =
    type === "complaint"
      ? CATEGORY_LABELS[category as ComplaintCategory] ?? category
      : WIKI_CATEGORY_LABELS[category as WikiCategory] ?? category;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {label}
    </span>
  );
}
