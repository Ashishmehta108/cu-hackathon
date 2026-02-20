import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PetitionDraft({
  petitionText,
  className,
}: {
  petitionText: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(petitionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-secondary" />
          <h3 className="font-serif text-sm font-semibold text-secondary">
            AI-Drafted Petition
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Petition body */}
      <div className="p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {petitionText}
        </pre>
      </div>
    </div>
  );
}
