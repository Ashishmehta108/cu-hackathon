import { Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { MagicLink } from "@/lib/types";

export function MagicLinkPanel({
  magicLinks,
  className,
}: {
  magicLinks: MagicLink[];
  className?: string;
}) {
  if (magicLinks.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-yellow-500/40 bg-yellow-500/10 p-5",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
          <Sparkles className="h-4 w-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-serif text-base font-semibold text-foreground">
            Community Wisdom Found
          </h3>
          <p className="text-xs text-muted-foreground">
            Local knowledge connected to this issue
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {magicLinks.map((link) => (
          <Link
            key={link.wikiEntryId}
            to="/wiki"
            className="group flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-card p-3 transition-colors duration-200"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {link.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {link.relevance}
              </p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Elder {link.elderName} &mdash; {link.location.village},{" "}
                {link.location.state}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
