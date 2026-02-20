import { useState, useEffect, useCallback } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
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

  // Timer
  useEffect(() => {
    if (state !== "recording") return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s >= 29) {
          // Auto-stop after 30s
          setState("done");
          return 30;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Fire onComplete when done
  useEffect(() => {
    if (state === "done" && onComplete) {
      const dummyBlob = new Blob(["dummy-audio-data"], { type: "audio/wav" });
      onComplete(dummyBlob);
    }
  }, [state, onComplete]);

  const handleStart = useCallback(() => {
    setSeconds(0);
    setState("recording");
  }, []);

  const handleStop = useCallback(() => {
    setState("done");
  }, []);

  const handleReset = useCallback(() => {
    setSeconds(0);
    setState("idle");
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
          {state === "idle" && <Mic className="h-8 w-8" />}
          {state === "recording" && <Square className="h-6 w-6" />}
          {state === "done" && <RotateCcw className="h-6 w-6" />}
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
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Record Again
        </Button>
      )}
    </div>
  );
}
