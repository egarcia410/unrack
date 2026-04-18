import { useState, useEffect, useRef } from "react";
import { Pause, Play, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { playTimerDone } from "../lib/audio";
import { showTimerNotification } from "../lib/notifications";
import { useRestTimer, dismissTimer } from "../stores/polaris";
import { IconButton } from "./icon-button";

type TimerStatus = "active" | "urgent" | "done";

const timerVariants = cva("px-5 py-3.5 transition-all duration-300 border-b-2", {
  variants: {
    status: {
      active: "bg-th-s1 border-th-s3 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
      urgent: "bg-th-s1 border-th-s3 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
      done: "bg-th-g border-th-gb shadow-[0_0_20px_var(--color-th-gb)]",
    },
  },
});

const countdownVariants = cva("text-3xl font-extrabold font-mono leading-none", {
  variants: {
    status: {
      active: "text-th-t",
      urgent: "text-th-t",
      done: "text-th-inv animate-timer-pulse",
    },
  },
});

const subtitleVariants = cva("text-xs font-semibold mt-1", {
  variants: {
    status: {
      active: "text-th-t3",
      urgent: "text-th-t3",
      done: "text-black/50",
    },
  },
});

const trackVariants = cva("h-2 rounded overflow-hidden", {
  variants: {
    status: {
      active: "bg-th-s3",
      urgent: "bg-th-s3",
      done: "bg-black/15",
    },
  },
});

const fillVariants = cva("h-full rounded transition-[width] duration-1000 ease-linear", {
  variants: {
    status: {
      active: "bg-th-a",
      urgent: "bg-th-y",
      done: "bg-black/20",
    },
  },
});

export const RestTimer = () => {
  const restTimer = useRestTimer();
  const { visible: showTimer, key: timerKey, duration, reason } = restTimer;

  const [now, setNow] = useState(Date.now);
  const startRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);
  const played = useRef(false);

  useEffect(() => {
    const timestamp = Date.now();
    startRef.current = timestamp;
    pausedAtRef.current = null;
    pausedMsRef.current = 0;
    played.current = false;
    setNow(timestamp);
  }, [timerKey, duration]);

  const paused = pausedAtRef.current !== null;
  const currentPausedMs =
    pausedMsRef.current + (pausedAtRef.current !== null ? now - pausedAtRef.current : 0);
  const left = Math.max(
    0,
    duration - Math.floor((now - startRef.current - currentPausedMs) / 1000),
  );

  useEffect(() => {
    if (!paused && left > 0) {
      const intervalId = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(intervalId);
    }
  }, [paused, left > 0]);

  useEffect(() => {
    if (left <= 0 && !played.current) {
      played.current = true;
      playTimerDone();
      showTimerNotification();
    }
  }, [left]);

  const togglePause = () => {
    if (pausedAtRef.current !== null) {
      pausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    } else {
      pausedAtRef.current = Date.now();
    }
    setNow(Date.now());
  };

  const formatTime = (totalSeconds: number) =>
    `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
  const done = left <= 0;
  const urgent = !done && left <= 10;
  const percentage = duration > 0 ? ((duration - left) / duration) * 100 : 100;
  const status: TimerStatus = done ? "done" : urgent ? "urgent" : "active";

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-20 mx-auto max-w-115 transition-transform duration-200",
        showTimer ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className={cn(timerVariants({ status }))}>
        <div className="flex items-center gap-3.5 mb-2">
          <div className="flex-1 min-w-0">
            <div className={cn(countdownVariants({ status }))}>
              {done ? "GO!" : formatTime(left)}
            </div>
            <div className={cn(subtitleVariants({ status }))}>
              {done ? "Time to unrack" : reason || "Rest"}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {!done && (
              <IconButton onClick={togglePause}>
                {paused ? <Play size={18} /> : <Pause size={18} />}
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
        <div className={cn(trackVariants({ status }))}>
          <div className={cn(fillVariants({ status }))} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
};
