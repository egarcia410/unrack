import { useState, useEffect, useRef } from "react";
import { ChevronRight, Pause } from "lucide-react";
import { cn } from "../lib/cn";
import { playTimerDone } from "../lib/audio";

interface RestTimerProps {
  dur: number;
  timerKey: number;
  onDismiss: () => void;
  why?: string;
}

export function RestTimer({ dur, timerKey, onDismiss, why }: RestTimerProps) {
  const [left, setLeft] = useState(dur);
  const [paused, setPaused] = useState(false);
  const played = useRef(false);
  useEffect(() => {
    setLeft(dur);
    setPaused(false);
    played.current = false;
  }, [timerKey, dur]);
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
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const done = left <= 0;
  const urgent = !done && left <= 10;
  const pct = dur > 0 ? ((dur - left) / dur) * 100 : 100;
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
              "text-[30px] font-extrabold font-mono leading-none",
              done ? "text-th-inv animate-timer-pulse" : "text-th-t",
            )}
          >
            {done ? "GO!" : fmt(left)}
          </div>
          <div
            className={cn(
              "text-[12px] font-semibold mt-[3px]",
              done ? "text-th-inv/50" : "text-th-t3",
            )}
            style={done ? { color: "rgba(0,0,0,0.5)" } : undefined}
          >
            {done ? "Next set ready" : why || "Rest"}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {!done && (
            <button
              onClick={() => setPaused(!paused)}
              className="w-[44px] h-[44px] rounded-[10px] border border-th-b bg-th-s2 text-th-t3 cursor-pointer flex items-center justify-center"
            >
              {paused ? <ChevronRight size={18} /> : <Pause size={18} />}
            </button>
          )}
          <button
            onClick={onDismiss}
            className={cn(
              "w-[44px] h-[44px] rounded-[10px] cursor-pointer flex items-center justify-center text-[20px] leading-none",
              done ? "border-transparent" : "border border-th-b bg-th-s2 text-th-t4",
            )}
            style={
              done
                ? {
                    background: "rgba(0,0,0,0.1)",
                    color: "rgba(0,0,0,0.5)",
                    border: "1px solid transparent",
                  }
                : undefined
            }
          >
            {"\u00D7"}
          </button>
        </div>
      </div>
      <div
        className={cn("h-2 rounded overflow-hidden", done ? "" : "bg-th-s3")}
        style={done ? { background: "rgba(0,0,0,0.15)" } : undefined}
      >
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
}
