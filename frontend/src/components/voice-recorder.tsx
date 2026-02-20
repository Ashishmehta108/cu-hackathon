import { useState, useEffect, useCallback } from "react";
import { Microphone, Stop, Refresh2 } from "iconsax-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RecorderState = "idle" | "recording" | "done";

export function VoiceRecorder({
  onComplete,
  className,
}: {
  onComplete?: (blob: Blob) => void;
  className?: string;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Timer
  useEffect(() => {
    if (state !== "recording") return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s >= 29) {
          // Auto-stop after 30s
          handleStop();
          return 30;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const handleStart = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType });
        if (onComplete) {
          onComplete(audioBlob);
        }
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setSeconds(0);
      setState("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record.");
    }
  }, [onComplete]);

  const handleStop = useCallback(() => {
    if (mediaRecorder && state === "recording") {
      mediaRecorder.stop();
      setState("done");
    }
  }, [mediaRecorder, state]);

  const handleReset = useCallback(() => {
    setSeconds(0);
    setState("idle");
    setMediaRecorder(null);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Mic button */}
      <div className="relative">
        {state === "recording" && (
          <>
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" />
            <div
              className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </>
        )}
        <button
          type="button"
          onClick={state === "idle" ? handleStart : state === "recording" ? handleStop : handleReset}
          className={cn(
            "relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-200",
            state === "idle" && "bg-primary text-primary-foreground",
            state === "recording" && "bg-destructive text-destructive-foreground",
            state === "done" && "bg-muted text-muted-foreground"
          )}
          aria-label={
            state === "idle" ? "Start recording" : state === "recording" ? "Stop recording" : "Reset recording"
          }
        >
          {state === "idle" && <Microphone className="h-8 w-8" variant="Linear" color="currentColor" />}
          {state === "recording" && <Stop className="h-6 w-6" variant="Linear" color="currentColor" />}
          {state === "done" && <Refresh2 className="h-6 w-6" variant="Linear" color="currentColor" />}
        </button>
      </div>

      {/* Waveform visualization */}
      {state === "recording" && (
        <div className="flex items-end gap-1 h-10" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-primary"
              style={{
                height: `${30 + Math.random() * 70}%`,
                animation: `pulse 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Timer */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-2xl font-bold text-foreground tabular-nums">
          {formatTime(seconds)}
        </span>
        <span className="text-sm text-muted-foreground">
          {state === "idle" && "Tap the mic to start recording"}
          {state === "recording" && "Recording... Tap to stop"}
          {state === "done" && "Recording complete"}
        </span>
      </div>

      {/* Reset button when done */}
      {state === "done" && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          <Refresh2 className="mr-1.5 h-3.5 w-3.5" variant="Linear" color="currentColor" />
          Record Again
        </Button>
      )}
    </div>
  );
}
