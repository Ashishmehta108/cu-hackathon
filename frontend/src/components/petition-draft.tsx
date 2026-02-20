import { useState } from "react";
import {
  Copy,
  TickCircle,
  DocumentText,
  Call,
  Sms,
  Link1,
  MagicStar,
  Send2,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sendEmail } from "@/lib/api";

export function PetitionDraft({
  petitionText,
  contactInfo,
  userLocation,
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
  userLocation?: {
    village: string;
    district: string;
    state: string;
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

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const toEmail = contactInfo?.email && contactInfo.email !== "Not found"
        ? contactInfo.email
        : "parasharabhijay@gmail.com"; // fallback to self for demo

      const today = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const village = userLocation?.village || "Gharuan";
      const district = userLocation?.district || "Sahibzada Ajit Singh Nagar";
      const state = userLocation?.state || "Punjab";

      const subject = `Formal Complaint – Public Concern in ${village}, ${district}, ${state}`;

      // Plain-text version
      const plainText = `The Citizens of ${village}
${village} Village
${district}, ${state}
awaazcommunity@gmail.com
${today}

To,
The District Magistrate,
District Administration,
${district},
${state}.

Subject: Formal Complaint Regarding Public Concern

Respected Sir/Madam,

I am writing to bring to your attention a matter of public concern in the village of ${village}, ${district}, ${state}. The issue pertains to:

${petitionText}

Despite repeated informal complaints, no action has been taken to address this issue. We kindly request the district administration to initiate immediate action to resolve this matter and improve the living conditions in our village.

We trust that your office will take prompt action to resolve this matter. We would be grateful for a written response outlining the steps being taken to address this concern.

Yours faithfully,
The Citizens of ${village}
${village} Village, ${district}, ${state}
awaazcommunity@gmail.com
${today}`;

      const htmlPayload = `
        <div style="font-family: 'Georgia', serif; max-width: 680px; margin: 0 auto; background: #FAFAF8; padding: 40px; color: #1C1714; border: 1px solid #E2DDD7;">

          <!-- Sender block -->
          <div style="margin-bottom: 28px; font-size: 14px; line-height: 1.8; color: #3D3530;">
            <strong>The Citizens of ${village}</strong><br/>
            ${village} Village<br/>
            ${district}, ${state}<br/>
            awaazcommunity@gmail.com<br/>
            <span style="color: #8B7355;">${today}</span>
          </div>

          <!-- Recipient block -->
          <div style="margin-bottom: 28px; font-size: 14px; line-height: 1.8; color: #3D3530;">
            <strong>To,</strong><br/>
            The District Magistrate,<br/>
            District Administration,<br/>
            ${district},<br/>
            ${state}.
          </div>

          <!-- Subject -->
          <div style="margin-bottom: 24px;">
            <strong style="font-size: 14px; color: #1C1714;">Subject: Formal Complaint Regarding Public Concern in ${village} Village</strong>
          </div>

          <!-- Salutation -->
          <p style="font-size: 14px; margin-bottom: 16px;">Respected Sir/Madam,</p>

          <!-- Body -->
          <p style="font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
            I am writing to bring to your attention a matter of public concern in the village of <strong>${village}</strong>, ${district}, ${state}. The issue pertains to:
          </p>

          <div style="background: #ffffff; border-left: 4px solid #C4874F; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 1.8; white-space: pre-wrap; color: #2C2420;">${petitionText}</div>

          <p style="font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
            Despite repeated informal complaints, no satisfactory action has been taken to address this issue. We kindly request the district administration to initiate <strong>immediate and appropriate action</strong> to resolve this matter and improve the living conditions in our village.
          </p>

          <p style="font-size: 14px; line-height: 1.8; margin-bottom: 32px;">
            We trust that your office will take prompt action to resolve this matter. We would be grateful for a written response outlining the steps being taken to address this concern.
          </p>

          <!-- Sign-off -->
          <div style="font-size: 14px; line-height: 1.8; color: #3D3530;">
            Yours faithfully,<br/>
            <strong>The Citizens of ${village}</strong><br/>
            ${village} Village, ${district}, ${state}<br/>
            awaazcommunity@gmail.com<br/>
            <span style="color: #8B7355;">${today}</span>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2DDD7; font-size: 11px; color: #A09080; text-align: center;">
            This petition was filed via <strong>Awaaz</strong> – Giving Voice to Every Village.
            ${contactInfo?.sourceUrl ? `| <a href="${contactInfo.sourceUrl}" style="color: #C4874F;">Official Source Verified</a>` : ''}
          </div>
        </div>
      `;

      const res = await sendEmail(toEmail, subject, plainText, htmlPayload);
      if (res.success) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        alert("Failed to send email. Check API configuration.");
      }
    } catch (err) {
      alert("Error sending email.");
    } finally {
      setSending(false);
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
            <Button
              variant="default"
              size="sm"
              onClick={handleSendEmail}
              disabled={sending || sent}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {sending ? "Sending..." : sent ? (
                <>
                  <TickCircle className="mr-1 h-3 w-3" variant="Linear" color="currentColor" /> Sent
                </>
              ) : (
                <>
                  <Send2 className="mr-1 h-3 w-3" variant="Linear" color="currentColor" /> Send to Authority
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
          <h4 className="text-xs font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
            <MagicStar className="h-3 w-3" variant="Linear" color="currentColor" />
            Official Contact Verification
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
                <Call className="h-3.5 w-3.5 text-emerald-700" variant="Linear" color="currentColor" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-600/70">Phone / Helpline</p>
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
                <p className="text-[11px] font-medium text-emerald-600/70">Official Email</p>
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

