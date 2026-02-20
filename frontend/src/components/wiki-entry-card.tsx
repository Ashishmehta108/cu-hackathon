import { useState } from "react";
import {
  Location as LocationIcon,
  User,
  VolumeHigh,
  ArrowDown2,
  ArrowUp2,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import type { WikiEntry } from "@/lib/types";

export function WikiEntryCard({
  entry,
  className,
}: {
  entry: WikiEntry;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "english" | "hindi">(
    "english"
  );

  const transcriptions = {
    original: entry.transcriptionOriginal,
    english: entry.transcriptionEnglish,
    hindi: entry.transcriptionHindi,
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card transition-all duration-200 overflow-hidden",
        expanded && "shadow-md",
        className
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <CategoryBadge category={entry.category} type="wiki" />
          <button
            type="button"
            onClick={() => {
              // Visual only - no real audio
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200"
            aria-label="Play audio"
          >
            <VolumeHigh className="h-4 w-4" variant="Linear" color="currentColor" />
          </button>
        </div>

        {/* Title + Elder */}
        <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1">
          {entry.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <User className="h-3 w-3" variant="Linear" color="currentColor" />
          <span>Elder {entry.elderName}</span>
          <span aria-hidden="true">&middot;</span>
          <LocationIcon className="h-3 w-3" variant="Linear" color="currentColor" />
          <span>
            {entry.location.village}, {entry.location.state}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3">
          {entry.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-muted-foreground"
        >
          {expanded ? (
            <>
              <ArrowUp2 className="mr-1 h-3.5 w-3.5" variant="Linear" color="currentColor" /> Hide Transcriptions
            </>
          ) : (
            <>
              <ArrowDown2 className="mr-1 h-3.5 w-3.5" variant="Linear" color="currentColor" /> View Transcriptions
            </>
          )}
        </Button>
      </div>

      {/* Expanded transcription tabs */}
      {expanded && (
        <div className="border-t border-border p-4">
          {/* Tab buttons */}
          <div className="flex gap-1 mb-3 rounded-lg bg-muted p-1">
            {(["original", "english", "hindi"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 capitalize",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transcription content */}
          <p className="text-sm leading-relaxed text-foreground">
            {transcriptions[activeTab]}
          </p>
        </div>
      )}
    </div>
  );
}
