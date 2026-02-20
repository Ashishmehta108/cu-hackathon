import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";
import { ComplaintCluster } from "@/components/complaint-cluster";
import { PetitionDraft } from "@/components/petition-draft";
import { MagicLinkPanel } from "@/components/magic-link-panel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchComplaintById, upvoteComplaint } from "@/lib/api";
import type { Complaint } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-muted text-muted-foreground" },
  processing: { label: "Processing", className: "bg-accent/20 text-accent-foreground" },
  petition_drafted: { label: "Petition Ready", className: "bg-primary/10 text-primary" },
  sent: { label: "Sent", className: "bg-blue-500/10 text-blue-600" },
  acknowledged: { label: "Acknowledged", className: "bg-green-500/10 text-green-600" },
  resolved: { label: "Resolved", className: "bg-green-500/15 text-green-600" },
};

export function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchComplaintById(id).then((data) => {
      setComplaint(data);
      setLoading(false);
    });
  }, [id]);

  const handleUpvote = async () => {
    if (!complaint || upvoting) return;
    setUpvoting(true);
    try {
      const newCount = await upvoteComplaint(complaint.id);
      setComplaint({ ...complaint, upvotes: newCount });
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSpinner message="Loading complaint details..." />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Complaint not found.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[complaint.status] ?? STATUS_MAP.submitted;
  const date = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex-1">
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
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Complaint Details
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={handleUpvote}
          disabled={upvoting}
          className="gap-1.5"
        >
          <ThumbsUp className="h-4 w-4" />
          {complaint.upvotes}
        </Button>
      </div>

      {/* Complaint content */}
      <div className="space-y-6">
        {/* Transcription */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Transcription
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Original ({complaint.language})</p>
              <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-lg">
                {complaint.transcription}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">English Translation</p>
              <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-lg">
                {complaint.translatedText}
              </p>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground">
                {complaint.location.village}, {complaint.location.district}, {complaint.location.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="text-foreground">{date}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>
              <span className="text-foreground ml-2">{complaint.department}</span>
            </div>
            {complaint.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {complaint.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cluster */}
        {complaint.clusterCount > 0 && (
          <ComplaintCluster count={complaint.clusterCount} category={complaint.category} />
        )}

        {/* Magic Link */}
        {complaint.magicLinks.length > 0 && (
          <MagicLinkPanel magicLinks={complaint.magicLinks} />
        )}

        {/* Petition */}
        {complaint.petitionText && (
          <PetitionDraft petitionText={complaint.petitionText} />
        )}
      </div>
    </div>
  );
}
