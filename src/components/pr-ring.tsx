import { useState, useEffect, useRef } from "react";
import { ConfettiBurst } from "./confetti-burst";

interface PRRingProps {
  size: number;
  min: number;
  prGoal: number | null;
  value: number;
  active: boolean;
  activated: boolean;
}

export function PRRing({ size, min, prGoal, value, active, activated }: PRRingProps) {
  const r = size / 2 - 4,
    cx = size / 2,
    cy = size / 2,
    sw = active ? 3.5 : 2.5,
    circ = 2 * Math.PI * r;
  const empty = !activated && value <= 0;
  const zeroReps = activated && value <= 0;
  const cap = prGoal || min;
  const pct = empty ? 0 : zeroReps ? 0 : Math.min(value / cap, 1);
  const off = circ - pct * circ;
  const isPR = !empty && !zeroReps && prGoal && value >= prGoal;
  const aboveMin = !empty && !zeroReps && value > min && !isPR;
  const atMin = !empty && !zeroReps && value === min;
  const underMin = !empty && !zeroReps && value < min;
  const clr = empty
    ? "var(--color-th-t4)"
    : zeroReps
      ? "var(--color-th-r)"
      : isPR
        ? "var(--color-th-go)"
        : aboveMin
          ? "var(--color-th-pr)"
          : atMin
            ? "var(--color-th-g)"
            : underMin
              ? "var(--color-th-r)"
              : "var(--color-th-g)";
  const prevPRRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (isPR && !prevPRRef.current) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 900);
      return () => clearTimeout(t);
    }
    if (!isPR) setShowConfetti(false);
    prevPRRef.current = !!isPR;
  }, [isPR]);
  return (
    <div className="relative shrink-0 overflow-visible" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-th-s3)" strokeWidth={sw} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={clr}
          strokeWidth={isPR ? sw + 1 : sw}
          strokeDasharray={circ}
          strokeDashoffset={empty ? circ : off}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset,stroke] duration-[400ms,300ms]"
        />
      </svg>
      {isPR && (
        <div className="absolute -inset-1 rounded-full animate-gold-glow pointer-events-none" />
      )}
      {showConfetti && active && <ConfettiBurst size={size} />}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-extrabold font-mono leading-none"
          style={{ fontSize: Math.round(size * 0.28), color: clr }}
        >
          {empty ? min + "+" : value}
        </span>
      </div>
    </div>
  );
}
