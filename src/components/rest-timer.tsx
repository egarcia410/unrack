import { useState, useEffect, useRef } from "react";
import { ChevronRight, Pause, X } from "lucide-react";
import { cn } from "../lib/cn";
import { playTimerDone } from "../lib/audio";
import { useAppStore } from "../stores/app-store";
import { IconButton } from "./icon-button";

export const RestTimer = () => {
  const showTimer = useAppStore.showTimer();
  const timerInfo = useAppStore.timerInfo();
  const timerKey = useAppStore.timerKey();
  const { dismissTimer } = useAppStore.actions();

  const duration = timerInfo.duration;
  const reason = timerInfo.reason;

  const [left, setLeft] = useState(duration);
  const [paused, setPaused] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    setLeft(duration);
    setPaused(false);
    played.current = false;
  }, [timerKey, duration]);

  useEffect(() => {
    if (!paused && left > 0) {
      const t = setTimeout(() => setLeft((l) => l - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [left, paused]);

  useEffect(() => {
    if (left <= 0 && !played.current) {
      played.current = true;
      playTimerDone();
    }
  }, [left]);

  if (!showTimer) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const done = left <= 0;
  const urgent = !done && left <= 10;
  const pct = duration > 0 ? ((duration - left) / duration) * 100 : 100;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 mx-[-16px] px-5 py-3.5 transition-all duration-300",
        done
          ? "bg-th-g border-b-2 border-th-gb shadow-[0_0_20px_var(--color-th-gb)]"
          : "bg-th-s1 border-b-2 border-th-s3 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
      )}
    >
      <div className="flex items-center gap-3.5 mb-2">
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-3xl font-extrabold font-mono leading-none",
              done ? "text-th-inv animate-timer-pulse" : "text-th-t",
            )}
          >
            {done ? "GO!" : formatTime(left)}
          </div>
          <div className={cn("text-xs font-semibold mt-1", done ? "text-black/50" : "text-th-t3")}>
            {done ? "Next set ready" : reason || "Rest"}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {!done && (
            <IconButton onClick={() => setPaused(!paused)}>
              {paused ? <ChevronRight size={18} /> : <Pause size={18} />}
            </IconButton>
          )}
          <IconButton
            onClick={dismissTimer}
            className={cn(done ? "border-transparent bg-black/10 text-black/50" : "")}
          >
            <X size={18} />
          </IconButton>
        </div>
      </div>
      <div className={cn("h-2 rounded overflow-hidden", done ? "bg-black/15" : "bg-th-s3")}>
        <div
          className="h-full rounded transition-[width] duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background: done
              ? "rgba(0,0,0,0.2)"
              : urgent
                ? "var(--color-th-y)"
                : "var(--color-th-a)",
          }}
        />
      </div>
    </div>
  );
};
