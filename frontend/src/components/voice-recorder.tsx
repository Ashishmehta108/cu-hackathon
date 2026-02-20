import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Microphone2, StopCircle, Refresh2, TickCircle } from "iconsax-react";
import { cn } from "@/lib/utils";

type RecorderState = "idle" | "recording" | "done";

// ─── Animated waveform bars ──────────────────────────────────────────────────────
function WaveformBars({ active }: { active: boolean }) {
  const BAR_COUNT = 28;
  // Bell-curve heights: taller in middle, shorter at edges
  const peaks = Array.from({ length: BAR_COUNT }, (_, i) => {
    const mid = (BAR_COUNT - 1) / 2;
    const dist = Math.abs(i - mid) / mid;
    return 0.18 + (1 - dist * dist) * 0.82;
  });

  return (
    <div className="flex items-center gap-[3px] h-10" aria-hidden="true">
      {peaks.map((peak, i) =>
        active ? (
          <motion.div
            key={i}
            className="rounded-full bg-[#C4874F]"
            style={{ width: 2.5 }}
            animate={{
              height: [
                `${peak * 28}px`,
                `${(0.15 + Math.random() * 0.7) * 28}px`,
                `${peak * 28}px`,
              ],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 0.9 + (i % 5) * 0.18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.04,
            }}
          />
        ) : (
          <motion.div
            key={i}
            className="rounded-full bg-[#E8E0D4]"
            style={{ width: 2.5 }}
            initial={false}
            animate={{ height: `${peak * 8}px` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )
      )}
    </div>
  );
}

// ─── Circular pulse rings ────────────────────────────────────────────────────────
function PulseRings() {
  return (
    <>
      {[1.6, 2.1, 2.7].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[#C4874F]"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale, opacity: [0, 0.35, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.55,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// ─── Main VoiceRecorder ──────────────────────────────────────────────────────────
export function VoiceRecorder({
  onComplete,
  className,
}: {
  onComplete?: (blob: Blob) => void;
  className?: string;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // ── Timer ──
  useEffect(() => {
    if (state !== "recording") return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s >= 59) {
          handleStop();
          return 60;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // ── Start ──
  const handleStart = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        onComplete?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setState("recording");
    } catch {
      alert("Please allow microphone access to record.");
    }
  }, [onComplete]);

  // ── Stop ──
  const handleStop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setState("done");
    }
  }, []);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setSeconds(0);
    setState("idle");
    mediaRecorderRef.current = null;
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const MAX_SECONDS = 60;
  const arcProgress = Math.min(seconds / MAX_SECONDS, 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * arcProgress;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-500",
          state === "recording"
            ? "border-[#C4874F]/35 bg-[#FEF9EE]"
            : state === "done"
              ? "border-[#10B981]/25 bg-[#F0FDF4]"
              : "border-[#E8E0D4] bg-[#FAF7F2]"
        )}
      >
        {/* Ambient background blur */}
        <div
          className={cn(
            "pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl transition-opacity duration-700",
            state === "recording" ? "bg-[#C4874F]/15 opacity-100" : "opacity-0"
          )}
        />

        <div className="relative flex flex-col items-center gap-5 px-6 py-8">

          {/* ── Mic button with SVG arc progress ── */}
          <div className="relative flex items-center justify-center">
            {/* SVG circle progress ring */}
            <svg
              className="absolute"
              width={108}
              height={108}
              viewBox="0 0 108 108"
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Track ring */}
              <circle
                cx={54} cy={54} r={radius}
                fill="none"
                stroke="#E8E0D4"
                strokeWidth={2.5}
              />
              {/* Progress ring */}
              <AnimatePresence>
                {state === "recording" && (
                  <motion.circle
                    cx={54} cy={54} r={radius}
                    fill="none"
                    stroke="#C4874F"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    initial={{ strokeDasharray: `0 ${circumference}`, opacity: 0 }}
                    animate={{
                      strokeDasharray: `${strokeDash} ${circumference}`,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.3, ease: "linear" }}
                  />
                )}
                {state === "done" && (
                  <motion.circle
                    cx={54} cy={54} r={radius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </svg>

            {/* Pulse rings (recording only) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-[84px] w-[84px] items-center justify-center">
                {state === "recording" && <PulseRings />}
              </div>
            </div>

            {/* Central button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={
                state === "idle"
                  ? handleStart
                  : state === "recording"
                    ? handleStop
                    : handleReset
              }
              aria-label={
                state === "idle"
                  ? "Start recording"
                  : state === "recording"
                    ? "Stop recording"
                    : "Record again"
              }
              className={cn(
                "relative z-10 flex h-[84px] w-[84px] items-center justify-center rounded-full transition-all duration-300",
                state === "idle" &&
                "bg-[#1C1714] text-[#FAF7F2] hover:bg-[#C4874F] hover:shadow-xl hover:shadow-[#C4874F]/25",
                state === "recording" &&
                "bg-[#C4874F] text-white shadow-xl shadow-[#C4874F]/30",
                state === "done" &&
                "bg-[#10B981]/10 text-[#10B981] border-2 border-[#10B981]/25"
              )}
            >
              <AnimatePresence mode="wait">
                {state === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Microphone2 size={30} variant="Bold" color="currentColor" />
                  </motion.div>
                )}
                {state === "recording" && (
                  <motion.div
                    key="recording"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <StopCircle size={28} variant="Bold" color="currentColor" />
                  </motion.div>
                )}
                {state === "done" && (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  >
                    <TickCircle size={32} variant="Bold" color="currentColor" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* ── Waveform ── */}
          <AnimatePresence>
            {(state === "recording" || state === "done") && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3 }}
              >
                <WaveformBars active={state === "recording"} />
              </motion.div>
            )}
            {state === "idle" && (
              <motion.div
                key="idle-wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WaveformBars active={false} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Timer + status ── */}
          <div className="flex flex-col items-center gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={state === "recording" ? seconds : state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "font-mono text-2xl font-bold tabular-nums tracking-tight",
                  state === "recording" ? "text-[#C4874F]" : state === "done" ? "text-[#10B981]" : "text-[#B8A898]"
                )}
              >
                {formatTime(seconds)}
              </motion.span>
            </AnimatePresence>

            <span
              className="text-[0.72rem] font-medium text-[#8B7355]"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {state === "idle" && "Tap the mic to begin"}
              {state === "recording" && "Recording — tap to stop"}
              {state === "done" && "Recording captured · ready to proceed"}
            </span>
          </div>

          {/* ── Re-record button ── */}
          <AnimatePresence>
            {state === "done" && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D4] bg-white/70 px-4 py-1.5 text-[0.7rem] font-semibold text-[#5C5040] hover:border-[#1C1714]/22 hover:text-[#1C1714] transition-all"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                <Refresh2 size={11} variant="Linear" color="currentColor" />
                Record again
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Max duration hint ── */}
          {state === "recording" && (
            <p
              className="text-[10px] font-medium text-[#C4874F]/60"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Max 60s · {MAX_SECONDS - seconds}s remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
