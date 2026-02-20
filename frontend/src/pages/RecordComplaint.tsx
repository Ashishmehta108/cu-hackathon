import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MapPin,
} from "lucide-react";
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
  { label: "Record", icon: Mic },
  { label: "Transcribe", icon: FileText },
  { label: "Categorize", icon: Sparkles },
  { label: "Petition", icon: FileText },
  { label: "Submit", icon: CheckCircle2 },
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
  const [magicLinks, setMagicLinks] = useState<any[]>([]);
  const [clusterCount, setClusterCount] = useState(0);

  const handleRecordingComplete = useCallback((_blob: Blob) => {
    setHasRecording(true);
  }, []);

  const handleGoToTranscribe = async () => {
    setStep(1);
    setIsProcessing(true);
    try {
      const dummyBlob = new Blob(["dummy"], { type: "audio/wav" });
      const transcribeResult = await transcribeAudio(dummyBlob, language);
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
      const petition = await draftPetition(
        translatedText,
        category!,
        { village, district, state }
      );
      setPetitionText(petition);
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
        language,
        location: { village, district, state },
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
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <h1 className="font-serif text-2xl font-bold text-foreground mb-1">
        Report a Community Issue
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Record your complaint in your language. AI will handle the rest.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
                i < step && "bg-green-500/10 text-green-600",
                i === step && "bg-primary text-primary-foreground",
                i > step && "bg-muted text-muted-foreground"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 0: Record */}
      {step === 0 && (
        <div>
          <div className="rounded-xl border border-border bg-card p-6">
            {/* Language selector */}
            <label className="block text-sm font-medium text-foreground mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-6 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.native})
                </option>
              ))}
            </select>

            {/* Voice Recorder */}
            <VoiceRecorder onComplete={handleRecordingComplete} className="mb-6" />

            {/* Location fields */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Location
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGoToTranscribe}
              disabled={!hasRecording || !village || !district || !state}
              className="gap-1.5"
            >
              Next: Transcribe
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Transcribe */}
      {step === 1 && (
        <div>
          <div className="rounded-xl border border-border bg-card p-6">
            {isProcessing ? (
              <LoadingSpinner message="AI is transcribing your complaint..." />
            ) : (
              <>
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Transcription
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Original ({language})</p>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-lg">
                      {transcription}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">English Translation</p>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/50 p-3 rounded-lg">
                      {translatedText}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleGoToCategorize}
              disabled={isProcessing}
              className="gap-1.5"
            >
              Next: Categorize
              <Sparkles className="h-4 w-4" />
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
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  Category & Department
                </h2>
                {category && <CategoryBadge category={category} className="mb-3" />}
                <p className="text-sm text-muted-foreground">{department}</p>
                {keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {keywords.map((kw) => (
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

              {clusterCount > 0 && category && (
                <ComplaintCluster count={clusterCount} category={category} />
              )}
            </div>
          )}

          {!isProcessing && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleGoToPetition} className="gap-1.5">
                Next: Draft Petition
                <FileText className="h-4 w-4" />
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
              <PetitionDraft petitionText={petitionText} />
              {magicLinks.length > 0 && <MagicLinkPanel magicLinks={magicLinks} />}
            </div>
          )}

          {!isProcessing && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} className="gap-1.5">
                Submit Complaint
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Submitted */}
      {step === 4 && (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
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
