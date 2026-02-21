import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microphone2,
  DocumentText,
  MagicStar,
  TickCircle,
  ArrowLeft2,
  ArrowRight2,
  Location as LocationIcon,
  Tag,
  Building,
} from "iconsax-react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { CategoryBadge } from "@/components/category-badge";
import { ComplaintCluster } from "@/components/complaint-cluster";
import { PetitionDraft } from "@/components/petition-draft";
import { MagicLinkPanel } from "@/components/magic-link-panel";
import {
  transcribeAudio,
  translateText,
  categorizeComplaint,
  draftPetition,
  findMagicLinks,
  submitComplaint,
  getClusterCount,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ComplaintCategory } from "@/lib/types";

// ─── Step config ────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Record", short: "01", icon: Microphone2, desc: "Speak your issue" },
  { label: "Transcribe", short: "02", icon: DocumentText, desc: "Review text" },
  { label: "Classify", short: "03", icon: MagicStar, desc: "AI categorises" },
  { label: "Petition", short: "04", icon: DocumentText, desc: "Draft letter" },
  { label: "Submit", short: "05", icon: TickCircle, desc: "Done" },
];

// ─── Animation variants ──────────────────────────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, x: 18, filter: "blur(3px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -18, filter: "blur(3px)" },
};

// ─── Noise texture ───────────────────────────────────────────────────────────────
function Grain({ opacity = 0.025 }: { opacity?: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl"
      aria-hidden="true"
      style={{ opacity }}
    >
      <filter id="rc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#rc-grain)" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-semibold text-[#8B7355]"
      style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      {children}
    </p>
  );
}

function Field({
  label, placeholder, value, onChange
}: {
  label?: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-[#8B7355]"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-[#E8E0D4] bg-white/70 px-3.5 text-[0.82rem] text-[#1C1714] placeholder:text-[#B8A898] focus:outline-none focus:border-[#C4874F]/50 focus:ring-2 focus:ring-[#C4874F]/10 transition-all duration-200"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      />
    </div>
  );
}

function TextBlock({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-4">
      <Grain opacity={0.018} />
      <p className="relative mb-2 text-[11px] font-semibold text-[#8B7355]"
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        {label}
      </p>
      <p className={cn(
        "relative text-[0.83rem] leading-[1.8]",
        accent ? "text-[#1C1714]" : "text-[#5C5040]"
      )}
        style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        {text || <span className="text-[#B8A898] italic">Awaiting processing…</span>}
      </p>
    </div>
  );
}

function NavBtn({
  onClick, disabled, variant = "primary", children, id
}: {
  onClick: () => void; disabled?: boolean; variant?: "primary" | "ghost"; children: React.ReactNode; id?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-6 text-[0.75rem] font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-[#1C1714] text-[#FAF7F2] hover:bg-[#C4874F] hover:shadow-md hover:shadow-[#C4874F]/20 hover:-translate-y-px"
          : "border border-[#E8E0D4] bg-transparent text-[#5C5040] hover:border-[#1C1714]/20 hover:text-[#1C1714] hover:bg-[#FAF7F2]"
      )}
      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────────
export function RecordComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("auto");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [department, setDepartment] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [petitionText, setPetitionText] = useState("");
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [magicLinks, setMagicLinks] = useState<any[]>([]);
  const [clusterCount, setClusterCount] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Camera state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep a ref to the stream so stopCamera always has the latest value
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            setVillage(data.address.village || data.address.town || data.address.city || data.address.suburb || "");
            setDistrict(data.address.state_district || data.address.county || "");
            setState(data.address.state || "");
          }
        } catch (e) {
          console.error("Geolocation reverse lookup failed", e);
        }
      });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/login');
  }, [navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setHasRecording(true);
    setRecordingBlob(blob);
  }, []);

  // ── stopCamera defined FIRST so startCamera can reference it ──
  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraStream(null);
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraActive(true);
      setVideoReady(false);

      // Wait for the videoRef to be attached to the DOM
      // Use a small timeout to let React re-render first
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) {
          console.error('Video element not found after render');
          stopCamera();
          return;
        }

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play()
            .then(() => {
              setVideoReady(true);
            })
            .catch((err) => {
              console.error('Video play failed:', err);
              alert('Unable to start camera preview. Please check your browser settings.');
              stopCamera();
            });
        };

        video.onerror = () => {
          console.error('Video element error');
          alert('Camera error. Please try again.');
          stopCamera();
        };

        // Fallback: if metadata never fires within 5s, try playing anyway
        setTimeout(() => {
          if (!videoReady) {
            video.play().then(() => setVideoReady(true)).catch(() => {
              alert('Camera preview failed. Please refresh and try again.');
              stopCamera();
            });
          }
        }, 5000);
      }, 100); // 100ms to allow React to render the video element

    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions and try again.');
      setCameraActive(false);
    }
  }, [stopCamera, videoReady]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      alert('Camera not ready. Please try again.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas to actual video dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay: timestamp + location
    const timestamp = new Date().toLocaleString();
    const locationText = `${village}, ${district}, ${state}`;
    ctx.font = 'bold 18px Arial';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    // Timestamp top-left
    ctx.strokeText(timestamp, 16, 36);
    ctx.fillText(timestamp, 16, 36);
    // Location below
    ctx.strokeText(locationText, 16, 64);
    ctx.fillText(locationText, 16, 64);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert('Failed to capture photo. Please try again.');
          return;
        }
        const file = new File([blob], `complaint-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImage(file);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        stopCamera();
      },
      'image/jpeg',
      0.85
    );
  }, [village, district, state, stopCamera]);

  const retakePhoto = useCallback(() => {
    setSelectedImage(null);
    setImage(null);
    startCamera();
  }, [startCamera]);

  const autoDetectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data?.address) {
          setVillage(data.address.village || data.address.town || data.address.city || data.address.suburb || "");
          setDistrict(data.address.state_district || data.address.county || "");
          setState(data.address.state || "");
        }
      } catch (e) { /* silent */ }
    });
  }, []);

  const handleGoToTranscribe = async () => {
    setStep(1);
    setIsProcessing(true);
    try {
      if (!recordingBlob) return;
      const transcribeResult = await transcribeAudio(recordingBlob, "auto");
      setTranscription(transcribeResult.transcription);
      setLanguage(transcribeResult.detectedLanguage);
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
      const count = await getClusterCount(categorizeResult.category, { village, district, state });
      setClusterCount(count);
    } catch (error) {
      console.error('Categorization failed:', error);
      alert('Failed to categorize complaint. Please try again.');
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToPetition = async () => {
    setStep(3);
    setIsProcessing(true);
    try {
      const result = await draftPetition(translatedText, category!, { village, district, state }, clusterCount + 1);
      setPetitionText(result.petition);
      setContactInfo(result.contact);
      const links = await findMagicLinks(translatedText, category!, { village, district, state });
      setMagicLinks(links);
    } catch (error) {
      console.error('Petition drafting failed:', error);
      alert('Failed to draft petition. Please try again.');
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!department || department.trim() === '') {
      alert('Please complete the categorization step to set the department.');
      return;
    }
    setStep(4);
    setIsProcessing(true);
    try {
      await submitComplaint({
        transcription, translatedText, language,
        category: category!, department, keywords,
        location: { village, district, state },
        petitionText, magicLinks, clusterCount,
        image: image || undefined,
      });
      setTimeout(() => navigate("/dashboard"), 2200);
    } finally {
      setIsProcessing(false);
    }
  };

  const completedSteps = step;
  const progress = (completedSteps / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#FAF7F2]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-5 py-10 pb-24">

        {/* ── Back link ── */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-[#8B7355] hover:text-[#1C1714] transition-colors"
        >
          <ArrowLeft2 size={13} variant="Linear" color="currentColor" />
          Back
        </motion.button>

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-10"
        >
          <p className="mb-1.5 text-[11px] font-semibold text-[#C4874F]">Citizen Complaint Portal</p>
          <h1
            className="text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#1C1714] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Report a Community Issue
          </h1>
          <p className="text-[0.8rem] text-[#8B7355] leading-relaxed">
            Speak your complaint in your language. Sarvam AI handles transcription, categorisation, and petition drafting.
          </p>
        </motion.div>

        {/* ── Step progress bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative mb-5 h-px bg-[#E8E0D4]">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#C4874F]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex items-start justify-between">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STEPS.length}%` }}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                      done
                        ? "bg-[#1C1714] border-[#1C1714] text-[#FAF7F2]"
                        : active
                          ? "bg-[#C4874F] border-[#C4874F] text-white shadow-md shadow-[#C4874F]/22"
                          : "bg-[#FAF7F2] border-[#E8E0D4] text-[#B8A898]"
                    )}
                  >
                    {done
                      ? <TickCircle size={14} variant="Bold" color="currentColor" />
                      : <Icon size={14} variant="Linear" color="currentColor" />
                    }
                  </div>
                  <span className={cn(
                    "hidden sm:block text-[10px] font-semibold transition-colors",
                    active ? "text-[#C4874F]" : done ? "text-[#5C5040]" : "text-[#B8A898]"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Step panels ── */}
        <AnimatePresence mode="wait">

          {/* ═══ STEP 0: Record ═══ */}
          {step === 0 && (
            <motion.div key="step-0" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-3">

              {/* Recorder card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70">
                <Grain opacity={0.018} />
                <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#C4874F]/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#8B9D5E]/8 blur-3xl pointer-events-none" />

                <div className="relative p-7">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-[#C4874F] mb-0.5">Voice Recording</p>
                      <p className="text-[0.78rem] text-[#8B7355]">Speak freely — in any Indian language</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full border border-[#E8E0D4] bg-[#FAF7F2] text-[0.7rem] font-medium text-[#5C5040]">
                      Auto-detecting language
                    </div>
                  </div>
                  <VoiceRecorder onComplete={handleRecordingComplete} />
                </div>

                {/* ── Camera section ── */}
                <div className="relative border-t border-[#E8E0D4] p-7 pt-6">
                  <SectionLabel>Attach an image (optional)</SectionLabel>
                  <p className="text-[0.72rem] text-[#8B7355] mb-4">
                    Take a photo of the issue for better documentation
                  </p>

                  {/* Hidden canvas used for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* State 1: No camera, no image → show "Take Photo" button */}
                  {!cameraActive && !selectedImage && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full h-32 border-2 border-dashed border-[#C4874F]/50 rounded-xl bg-[#C4874F]/5 hover:bg-[#C4874F]/10 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C4874F]/20 flex items-center justify-center text-xl">
                        📷
                      </div>
                      <p className="text-[0.8rem] font-medium text-[#C4874F]">Open Camera</p>
                    </button>
                  )}

                  {/* State 2: Camera active → show viewfinder */}
                  {cameraActive && (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: '200px' }}>
                        {/* Loading spinner shown until video is ready */}
                        {!videoReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                            <p className="text-sm">Starting camera…</p>
                          </div>
                        )}
                        {/* Video element — always in DOM when cameraActive so ref is valid */}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ display: videoReady ? 'block' : 'none' }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Buttons appear only once video is actually playing */}
                      {videoReady && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 bg-[#C4874F] text-white py-3 rounded-xl font-semibold hover:bg-[#B3773F] active:scale-95 transition-all flex items-center justify-center gap-2 text-[0.85rem]"
                          >
                            📸 Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-5 py-3 border border-[#E8E0D4] rounded-xl font-medium hover:bg-[#FAF7F2] transition-colors text-[0.85rem] text-[#5C5040]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* State 3: Image captured → show preview */}
                  {selectedImage && !cameraActive && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-[#8B7355] mb-2">Photo captured ✓</p>
                        <img
                          src={selectedImage}
                          alt="Captured complaint photo"
                          className="w-full h-48 object-cover rounded-xl border border-[#E8E0D4]"
                        />
                        <p className="text-[11px] text-[#8B7355] mt-2">
                          {new Date().toLocaleString()} · {village}, {district}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="w-full py-2 text-[0.8rem] font-medium text-[#C4874F] hover:text-[#B3773F] transition-colors"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Location card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/50 p-6">
                <Grain opacity={0.015} />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[#8B7355] inline-flex items-center gap-1.5">
                      <LocationIcon size={11} variant="Linear" color="currentColor" />
                      Where is this complaint from?
                    </p>
                    <button
                      type="button"
                      onClick={autoDetectLocation}
                      className="flex items-center gap-1 text-[10px] text-[#C4874F] hover:text-[#1C1714] transition-colors font-medium"
                    >
                      <MagicStar size={10} variant="Linear" /> Auto-detect
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field placeholder="Village / Town" value={village} onChange={setVillage} />
                    <Field placeholder="District" value={district} onChange={setDistrict} />
                    <Field placeholder="State" value={state} onChange={setState} />
                  </div>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-[#B8A898]">
                    Helps cluster similar complaints nearby and correctly address your petition.
                  </p>
                </div>
              </div>

              {/* Readiness hint */}
              {hasRecording && village && district && state && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-1"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <p className="text-[10px] font-medium text-[#10B981]">
                    Ready · recording captured + location set
                  </p>
                </motion.div>
              )}

              <div className="flex justify-end pt-1">
                <NavBtn
                  id="step0-next"
                  onClick={handleGoToTranscribe}
                  disabled={!hasRecording || !village || !district || !state}
                >
                  Transcribe
                  <ArrowRight2 size={13} variant="Linear" color="currentColor" />
                </NavBtn>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 1: Transcribe ═══ */}
          {step === 1 && (
            <motion.div key="step-1" variants={slideVariants} initial="enter" animate="center" exit="exit">
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70 p-7">
                <Grain opacity={0.018} />
                <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[#8B9D5E]/8 blur-3xl pointer-events-none" />

                {isProcessing ? (
                  <div className="relative flex flex-col items-center justify-center py-14 gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#C4874F]/20"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full border-2 border-[#C4874F]/30"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                      <DocumentText size={22} variant="Linear" color="#C4874F" />
                    </div>
                    <div className="text-center">
                      <p className="text-[0.85rem] font-medium text-[#1C1714] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Transcribing your voice
                      </p>
                      <p className="text-[0.72rem] text-[#8B7355]">Sarvam AI is converting audio to text…</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative space-y-4">
                    <SectionLabel>Transcription result</SectionLabel>
                    <TextBlock label={`Original (${language.toUpperCase()})`} text={transcription} accent />
                    <TextBlock label="English translation" text={translatedText} />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <NavBtn variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft2 size={13} variant="Linear" color="currentColor" /> Back
                </NavBtn>
                <NavBtn id="step1-next" onClick={handleGoToCategorize} disabled={isProcessing}>
                  AI Classify <MagicStar size={13} variant="Linear" color="currentColor" />
                </NavBtn>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: Categorize ═══ */}
          {step === 2 && (
            <motion.div key="step-2" variants={slideVariants} initial="enter" animate="center" exit="exit">
              {isProcessing ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70 p-7">
                  <Grain opacity={0.018} />
                  <div className="relative flex flex-col items-center justify-center py-14 gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#C4874F]/20"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <MagicStar size={22} variant="Linear" color="#C4874F" />
                    </div>
                    <div className="text-center">
                      <p className="text-[0.85rem] font-medium text-[#1C1714] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Classifying complaint
                      </p>
                      <p className="text-[0.72rem] text-[#8B7355]">AI is identifying category, department & keywords…</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70 p-7">
                    <Grain opacity={0.018} />
                    <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#C4874F]/7 blur-3xl pointer-events-none" />
                    <div className="relative">
                      <SectionLabel>AI classification</SectionLabel>
                      <div className="space-y-5">
                        {category && (
                          <div>
                            <p className="mb-2 text-[11px] font-semibold text-[#B8A898]">Category</p>
                            <CategoryBadge category={category} />
                          </div>
                        )}
                        {department && (
                          <div className="flex items-start gap-3 rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] px-4 py-3">
                            <Building size={14} variant="Linear" color="#8B7355" className="mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[11px] font-semibold text-[#8B7355] mb-0.5">Addressed to</p>
                              <p className="text-[0.8rem] font-medium text-[#1C1714]">{department}</p>
                            </div>
                          </div>
                        )}
                        {keywords.length > 0 && (
                          <div className="border-t border-[#E8E0D4] pt-5">
                            <div className="flex items-center gap-1.5 mb-3">
                              <Tag size={11} variant="Linear" color="#8B7355" />
                              <p className="text-[11px] font-semibold text-[#8B7355]">Extracted keywords</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {keywords.map((kw) => (
                                <span key={kw} className="inline-flex items-center rounded-full border border-[#E8E0D4] bg-[#FAF7F2] px-3 py-1 text-[11px] font-medium text-[#5C5040]">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {clusterCount > 0 && category && (
                    <div className="rounded-2xl overflow-hidden border border-[#E8E0D4]">
                      <ComplaintCluster count={clusterCount} category={category} />
                    </div>
                  )}
                </div>
              )}

              {!isProcessing && (
                <div className="mt-6 flex justify-between">
                  <NavBtn variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft2 size={13} variant="Linear" color="currentColor" /> Back
                  </NavBtn>
                  <NavBtn id="step2-next" onClick={handleGoToPetition}>
                    Draft Petition <DocumentText size={13} variant="Linear" color="currentColor" />
                  </NavBtn>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 3: Petition ═══ */}
          {step === 3 && (
            <motion.div key="step-3" variants={slideVariants} initial="enter" animate="center" exit="exit">
              {isProcessing ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70 p-7">
                  <Grain opacity={0.018} />
                  <div className="relative flex flex-col items-center justify-center py-14 gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#C4874F]/20"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <DocumentText size={22} variant="Linear" color="#C4874F" />
                    </div>
                    <div className="text-center">
                      <p className="text-[0.85rem] font-medium text-[#1C1714] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Drafting your petition
                      </p>
                      <p className="text-[0.72rem] text-[#8B7355]">Sarvam-M is writing a formal complaint letter…</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <PetitionDraft petitionText={petitionText} contactInfo={contactInfo} userLocation={{ village, district, state }} />
                  {magicLinks.length > 0 && <MagicLinkPanel magicLinks={magicLinks} />}
                </div>
              )}

              {!isProcessing && (
                <div className="mt-6 flex justify-between">
                  <NavBtn variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft2 size={13} variant="Linear" color="currentColor" /> Back
                  </NavBtn>
                  <NavBtn id="step3-submit" onClick={handleSubmit}>
                    Submit Complaint <TickCircle size={13} variant="Linear" color="currentColor" />
                  </NavBtn>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 4: Submitted ═══ */}
          {step === 4 && (
            <motion.div key="step-4" variants={slideVariants} initial="enter" animate="center" exit="exit">
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white/70 px-7 py-16 text-center">
                <Grain opacity={0.018} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#10B981]/3 to-transparent pointer-events-none" />
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#10B981]/20 bg-[#10B981]/8"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300 }}>
                      <TickCircle size={36} variant="Bold" color="#10B981" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full border border-[#10B981]/15"
                    animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full border border-[#10B981]/10"
                    animate={{ scale: [1, 2.4, 2.4], opacity: [0.4, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[1.5rem] font-normal leading-tight tracking-[-0.02em] text-[#1C1714] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Complaint submitted
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[0.8rem] text-[#8B7355] max-w-xs mx-auto leading-relaxed"
                  >
                    Your formal petition has been lodged. Redirecting to dashboard…
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex justify-center gap-1.5"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[#C4874F]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}