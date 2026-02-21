import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft2,
  Location as LocationIcon,
  Timer1,
  Like1,
} from "iconsax-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";
import { ComplaintCluster } from "@/components/complaint-cluster";
import { PetitionDraft } from "@/components/petition-draft";
import { MagicLinkPanel } from "@/components/magic-link-panel";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MapView } from "@/components/map-view";
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
        <ArrowLeft2 className="h-3.5 w-3.5" variant="Linear" color="currentColor" />
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
          <Like1 className="h-4 w-4" variant="Linear" color="currentColor" />
          {complaint.upvotes}
        </Button>
      </div>

      {/* Complaint content */}
      <div className="space-y-6">
        {/* Image */}
        {complaint.imageUrl && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Attached Image
            </h2>
            <a
              href={complaint.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-border bg-muted/30 hover:opacity-95 transition-opacity"
            >
              <img
                src={complaint.imageUrl}
                alt="Complaint evidence"
                className="w-full max-h-[400px] object-contain"
              />
            </a>
            {complaint.imageTimestamp && (
              <p className="text-xs text-muted-foreground mt-2">
                Captured: {new Date(complaint.imageTimestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}

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
              <LocationIcon className="h-4 w-4 text-muted-foreground" variant="Linear" color="currentColor" />
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground">
                {complaint.location.village}, {complaint.location.district}, {complaint.location.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Timer1 className="h-4 w-4 text-muted-foreground" variant="Linear" color="currentColor" />
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

        {/* Map View */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Location
          </h2>
          <MapView complaints={[complaint]} className="h-[300px]" />
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
          <PetitionDraft petitionText={complaint.petitionText} userLocation={complaint.location} />
        )}

        {/* Status History */}
        {complaint.statusHistory && complaint.statusHistory.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Status History
            </h2>
            <div className="space-y-3">
              {complaint.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {entry.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Log */}
        {complaint.emails && complaint.emails.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Email Communications
            </h2>
            <div className="space-y-3">
              {complaint.emails.map((email, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      email.type === 'sent' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    )}>
                      {email.type === 'sent' ? 'Sent' : 'Received'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(email.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{email.subject}</p>
                    {email.to && <p className="text-muted-foreground">To: {email.to}</p>}
                    {email.from && <p className="text-muted-foreground">From: {email.from}</p>}
                    <p className="mt-1 text-foreground">{email.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
