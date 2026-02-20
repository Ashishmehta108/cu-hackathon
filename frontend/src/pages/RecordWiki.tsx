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
  User,
} from "iconsax-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/voice-recorder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CategoryBadge } from "@/components/category-badge";
import { LANGUAGES } from "@/lib/types";
import type { WikiCategory } from "@/lib/types";
import { processWikiEntry, createWikiEntry } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Record", icon: Microphone },
  { label: "Review", icon: DocumentText },
  { label: "AI Tags", icon: MagicStar },
  { label: "Published", icon: TickCircle },
];

export function RecordWiki() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [elderName, setElderName] = useState("");
  const [language, setLanguage] = useState("hi");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [hasRecording, setHasRecording] = useState(false);

  // Review data
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionOriginal, setTranscriptionOriginal] = useState("");
  const [transcriptionEnglish, setTranscriptionEnglish] = useState("");
  const [transcriptionHindi, setTranscriptionHindi] = useState("");
  const [activeTab, setActiveTab] = useState<"original" | "english" | "hindi">("english");

  // AI tags data
  const [isTagging, setIsTagging] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState<WikiCategory | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedDescription, setSuggestedDescription] = useState("");

  const handleRecordingComplete = useCallback((_blob: Blob) => {
    setHasRecording(true);
  }, []);

  const handleGoToReview = async () => {
    setStep(1);
    setIsProcessing(true);
    try {
      const dummyBlob = new Blob(["dummy"], { type: "audio/wav" });
      const result = await processWikiEntry({
        audioBlob: dummyBlob,
        elderName,
        language,
        location: { village, district, state },
      });
      setTranscriptionOriginal(result.transcriptionOriginal);
      setTranscriptionEnglish(result.transcriptionEnglish);
      setTranscriptionHindi(result.transcriptionHindi);
      setSuggestedTitle(result.suggestedTitle);
      setSuggestedCategory(result.suggestedCategory);
      setSuggestedTags(result.suggestedTags);
      setSuggestedDescription(result.suggestedDescription);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToTags = () => {
    setStep(2);
    setIsTagging(true);
    setTimeout(() => setIsTagging(false), 800);
  };

  const handlePublish = async () => {
    setStep(3);
    await createWikiEntry({
      transcriptionOriginal,
      transcriptionEnglish,
      transcriptionHindi,
      language,
      title: suggestedTitle,
      category: suggestedCategory || "other",
      tags: suggestedTags,
      description: suggestedDescription,
      elderName,
      location: { village, district, state },
    });
    setTimeout(() => {
      navigate("/wiki");
    }, 2000);
  };

  const transcriptions = {
    original: transcriptionOriginal,
    english: transcriptionEnglish,
    hindi: transcriptionHindi,
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
        Share Community Wisdom
      </h1>
      <p className="text-xs font-medium text-muted-foreground mb-8">
        Preserve indigenous knowledge from your elders
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
            {/* Elder name */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <User className="h-3.5 w-3.5 text-primary/60" variant="Linear" />
                Elder Name
              </label>
              <input
                type="text"
                placeholder="Name of the knowledge holder"
                value={elderName}
                onChange={(e) => setElderName(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

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

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleGoToReview}
              disabled={!hasRecording || !elderName}
              className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              Next: Review
              <ArrowRight3 className="h-4 w-4" variant="Linear" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Review Transcriptions */}
      {step === 1 && (
        <div>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            {isProcessing ? (
              <LoadingSpinner message="AI is transcribing and translating..." />
            ) : (
              <>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Transcription & Translations
                </h2>

                {/* Tab buttons */}
                <div className="flex gap-1 mb-6 rounded-xl bg-muted/50 p-1 border border-border/30">
                  {(["original", "english", "hindi"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 capitalize",
                        activeTab === tab
                          ? "bg-background text-primary shadow-sm border border-border/20"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <textarea
                  value={transcriptions[activeTab]}
                  onChange={(e) => {
                    if (activeTab === "original") setTranscriptionOriginal(e.target.value);
                    if (activeTab === "english") setTranscriptionEnglish(e.target.value);
                    if (activeTab === "hindi") setTranscriptionHindi(e.target.value);
                  }}
                  rows={6}
                  className="w-full rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-inner"
                />
                <p className="mt-3 text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1.5">
                  <DocumentText size={12} variant="Linear" />
                  You can edit translations if needed
                </p>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all border-border/60 hover:bg-muted/50">
              <ArrowLeft2 className="h-4 w-4" variant="Linear" />
              Back
            </Button>
            <Button
              onClick={handleGoToTags}
              disabled={isProcessing}
              className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              Next: AI Tags
              <MagicStar className="h-4 w-4" variant="Linear" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: AI Tags */}
      {step === 2 && (
        <div>
          {isTagging ? (
            <LoadingSpinner message="Generating tags and metadata..." />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                AI-Generated Metadata
              </h2>

              {/* Title */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Suggested Title
              </label>
              <input
                type="text"
                value={suggestedTitle}
                onChange={(e) => setSuggestedTitle(e.target.value)}
                className="mb-4 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {/* Category */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Category
              </label>
              <div className="mb-4">
                {suggestedCategory && (
                  <CategoryBadge category={suggestedCategory} type="wiki" />
                )}
              </div>

              {/* Description */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Description
              </label>
              <textarea
                value={suggestedDescription}
                onChange={(e) => setSuggestedDescription(e.target.value)}
                rows={3}
                className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />

              {/* Tags */}
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                All fields are editable. Adjust as needed before publishing.
              </p>
            </div>
          )}

          {!isTagging && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all border-border/60 hover:bg-muted/50">
                <ArrowLeft2 className="h-4 w-4" variant="Linear" />
                Back
              </Button>
              <Button onClick={handlePublish} className="gap-1.5 h-10 rounded-full px-6 text-xs font-bold transition-all shadow-sm hover:shadow-md bg-emerald-600 hover:bg-emerald-700 text-white border-transparent">
                Publish Entry
                <TickCircle className="h-4 w-4" variant="Linear" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Published */}
      {step === 3 && (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
            <TickCircle className="h-8 w-8 text-green-600" variant="Linear" color="currentColor" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Wisdom Published
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            {`Elder ${elderName || "Unknown"}'s knowledge has been preserved and is now available to the community.`}
          </p>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-5 text-left mb-6">
            <h3 className="font-serif text-base font-semibold text-foreground mb-1">
              {suggestedTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <User className="h-3 w-3" />
              Elder {elderName}
              {village && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <LocationIcon className="h-3 w-3" variant="Linear" />
                  {village}, {state}
                </>
              )}
            </div>
            {suggestedCategory && (
              <CategoryBadge category={suggestedCategory} type="wiki" className="mb-2" />
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {suggestedDescription}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate("/wiki")} className="gap-1.5">
              Browse Wiki
              <ArrowRight3 className="h-4 w-4" variant="Linear" color="currentColor" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
