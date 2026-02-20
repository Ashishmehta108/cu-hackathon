import { Link } from "react-router-dom";
import { MapPin, ThumbsUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import type { Complaint } from "@/lib/types";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-muted text-muted-foreground" },
  processing: { label: "Processing", className: "bg-accent/20 text-accent-foreground" },
  petition_drafted: { label: "Petition Ready", className: "bg-primary/10 text-primary" },
  sent: { label: "Sent", className: "bg-blue-500/10 text-blue-600" },
  acknowledged: { label: "Acknowledged", className: "bg-green-500/10 text-green-600" },
  resolved: { label: "Resolved", className: "bg-green-500/15 text-green-600" },
};

export function ComplaintCard({
  complaint,
  className,
}: {
  complaint: Complaint;
  className?: string;
}) {
  const status = STATUS_MAP[complaint.status] ?? STATUS_MAP.submitted;
  const date = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <Link to={`/complaint/${complaint.id}`} className="block">
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-4 transition-colors duration-200",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Category + Status */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CategoryBadge category={complaint.category} />
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>

            {/* Transcription preview */}
            <p className="text-sm leading-relaxed text-foreground line-clamp-2 mb-2">
              {complaint.translatedText}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {complaint.location.village}, {complaint.location.district}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {complaint.upvotes}
              </span>
            </div>
          </div>

          {/* Department label */}
          <div className="hidden sm:block shrink-0 max-w-[140px]">
            <p className="text-xs text-muted-foreground text-right leading-snug">
              {complaint.department}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
