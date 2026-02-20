import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Microphone,
  DocumentText,
  MagicStar,
  TickCircle,
  ArrowLeft2,
  ArrowRight3,
  Location as LocationIcon,
} from "iconsax-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/voice-recorder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CategoryBadge } from "@/components/category-badge";
import { ComplaintCluster } from "@/components/complaint-cluster";
import { PetitionDraft } from "@/components/petition-draft";
import { MagicLinkPanel } from "@/components/magic-link-panel";
import { LANGUAGES } from "@/lib/types";
import {
  transcribeAudio,
  translateText,
  categorizeComplaint,
  draftPetition,
  findMagicLinks,
  submitComplaint,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ComplaintCategory } from "@/lib/types";

const STEPS = [
  { label: "Record", icon: Microphone },
  { label: "Transcribe", icon: DocumentText },
  { label: "Categorize", icon: MagicStar },
  { label: "Petition", icon: DocumentText },
  { label: "Submit", icon: TickCircle },
];

export function RecordComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("hi");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [hasRecording, setHasRecording] = useState(false);

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [department, setDepartment] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [petitionText, setPetitionText] = useState("");
  const [contactInfo, setContactInfo] = useState<any>(null); // New state for contact details
  const [magicLinks, setMagicLinks] = useState<any[]>([]);
  const [clusterCount, setClusterCount] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setHasRecording(true);
    setRecordingBlob(blob);
  }, []);

  const handleGoToTranscribe = async () => {
    setStep(1);
    setIsProcessing(true);
    try {
      if (!recordingBlob) return;
      const transcribeResult = await transcribeAudio(recordingBlob, language);
      setTranscription(transcribeResult.transcription);
      const translateResult = await translateText(
        transcribeResult.transcription,
        transcribeResult.detectedLanguage,
        "en"
      );
      setTranslatedText(translateResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToCategorize = async () => {
    setStep(2);
    setIsProcessing(true);
    try {
      const categorizeResult = await categorizeComplaint(translatedText);
      setCategory(categorizeResult.category);
      setDepartment(categorizeResult.department);
      setKeywords(categorizeResult.keywords);
      setClusterCount(12); // Mock cluster count
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToPetition = async () => {
    setStep(3);
    setIsProcessing(true);
    try {
      const result = await draftPetition(
        translatedText,
        category!,
        { village, district, state }
      );
      setPetitionText(result.petition);
      setContactInfo(result.contact);
      const links = await findMagicLinks(
        translatedText,
        category!,
        { village, district, state }
      );
      setMagicLinks(links);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setStep(4);
    setIsProcessing(true);
    try {
      await submitComplaint({
        transcription,
        translatedText,
        language,
        category: category!,
        department,
        keywords,
        location: { village, district, state },
        petitionText,
        magicLinks,
        clusterCount,
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200"
      >
        <ArrowLeft2 className="h-3.5 w-3.5" variant="Linear" color="currentColor" />
        Back
      </button>

      <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">
        Report a Community Issue
      </h1>
      <p className="text-xs font-medium text-muted-foreground mb-8">
        Record your complaint in your language. AI will handle the rest.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                i < step && "bg-green-500/5 text-green-600/80 border border-green-500/10",
                i === step && "bg-primary text-primary-foreground shadow-sm",
                i > step && "bg-muted/50 text-muted-foreground/50 border border-transparent"
              )}
            >
              <s.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 0: Record */}
      {step === 0 && (
        <div>
          <div className="rounded-2xl border border-border/50 bg-card p-6 transition-all">
            {/* Language selector */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-8 h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.native})
                </option>
              ))}
            </select>

            {/* Voice Recorder */}
            <VoiceRecorder onComplete={handleRecordingComplete} className="mb-8" />

            {/* Location fields */}
            <div className="border-t border-border/40 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <LocationIcon className="h-4 w-4 text-primary/60" variant="Linear" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Location Details
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGoToTranscribe}
              disabled={!hasRecording || !village || !district || !state}
              className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              Next: Transcribe
              <ArrowRight3 className="h-4 w-4" variant="Linear" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Transcribe */}
      {step === 1 && (
        <div>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            {isProcessing ? (
              <LoadingSpinner message="AI is transcribing your complaint..." />
            ) : (
              <>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Transcription Result
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/40 mb-1.5">Original ({language})</p>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/30 p-4 rounded-xl border border-border/30">
                      {transcription}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/40 mb-1.5">English Translation</p>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/30 p-4 rounded-xl border border-border/30">
                      {translatedText}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all border-border/60 hover:bg-muted/50">
              <ArrowLeft2 className="h-4 w-4" variant="Linear" />
              Back
            </Button>
            <Button
              onClick={handleGoToCategorize}
              disabled={isProcessing}
              className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              Next: Categorize
              <MagicStar className="h-4 w-4" variant="Linear" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Categorize */}
      {step === 2 && (
        <div>
          {isProcessing ? (
            <LoadingSpinner message="AI is categorizing your complaint..." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  AI Classification
                </h2>
                {category && <CategoryBadge category={category} className="mb-4" />}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  <p className="text-xs font-bold text-foreground/70 uppercase tracking-tight">{department}</p>
                </div>
                {keywords.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-border/30">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center rounded-full bg-muted/50 border border-border/40 px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {clusterCount > 0 && category && (
                <div className="rounded-2xl overflow-hidden shadow-sm border border-border/30">
                  <ComplaintCluster count={clusterCount} category={category} />
                </div>
              )}
            </div>
          )}

          {!isProcessing && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all border-border/60 hover:bg-muted/50">
                <ArrowLeft2 className="h-4 w-4" variant="Linear" />
                Back
              </Button>
              <Button onClick={handleGoToPetition} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md">
                Next: Draft Petition
                <DocumentText className="h-4 w-4" variant="Linear" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Petition */}
      {step === 3 && (
        <div>
          {isProcessing ? (
            <LoadingSpinner message="AI is drafting your petition..." />
          ) : (
            <div className="space-y-4">
              <PetitionDraft petitionText={petitionText} contactInfo={contactInfo} />
              {magicLinks.length > 0 && <MagicLinkPanel magicLinks={magicLinks} />}
            </div>
          )}

          {!isProcessing && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all border-border/60 hover:bg-muted/50">
                <ArrowLeft2 className="h-4 w-4" variant="Linear" />
                Back
              </Button>
              <Button onClick={handleSubmit} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md bg-green-600 hover:bg-green-700 text-white border-transparent">
                Submit Complaint
                <TickCircle className="h-4 w-4" variant="Linear" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Submitted */}
      {step === 4 && (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
            <TickCircle className="mx-auto h-12 w-12 text-primary" variant="Linear" color="currentColor" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Complaint Submitted
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Your complaint has been submitted successfully. Redirecting to dashboard...
          </p>
        </div>
      )}
    </div>
  );
}
