import { useState } from "react";
import {
  Copy,
  TickCircle,
  DocumentText,
  Call,
  Sms,
  Link1,
  MagicStar,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PetitionDraft({
  petitionText,
  contactInfo,
  className,
}: {
  petitionText: string;
  contactInfo?: {
    department: string;
    location: string;
    contactNumber: string;
    email: string;
    sourceUrl: string;
    confidence: number;
  };
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
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl border border-border bg-card overflow-hidden transition-all duration-300",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <DocumentText className="h-4 w-4 text-secondary" variant="Linear" color="currentColor" />
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
                  <TickCircle className="mr-1 h-3 w-3" variant="Linear" color="currentColor" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" variant="Linear" color="currentColor" /> Copy
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

      {/* Contact Info Card */}
      {contactInfo && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 transition-all duration-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
            <MagicStar className="h-3 w-3" variant="Linear" color="currentColor" />
            Official Contact Verification
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
                <Call className="h-3.5 w-3.5 text-emerald-700" variant="Linear" color="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-emerald-600/70 uppercase">Phone / Helpline</p>
                <p className="text-sm font-semibold text-emerald-900">
                  {contactInfo.contactNumber !== "Not found" ? contactInfo.contactNumber : "No number found"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
                <Sms className="h-3.5 w-3.5 text-emerald-700" variant="Linear" color="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-emerald-600/70 uppercase">Official Email</p>
                <p className="text-sm font-semibold text-emerald-900 break-all">
                  {contactInfo.email !== "Not found" ? contactInfo.email : "No email found"}
                </p>
              </div>
            </div>
          </div>

          {contactInfo.sourceUrl && (
            <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
              <a
                href={contactInfo.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 hover:underline"
              >
                <Link1 className="h-3 w-3" variant="Linear" color="currentColor" />
                Source: {new URL(contactInfo.sourceUrl).hostname}
              </a>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">
                  Verified Official
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

