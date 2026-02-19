import { useState, useEffect, useRef } from "react";
import { ConfettiBurst } from "./confetti-burst";

type PRRingProps = {
  size: number;
  min: number;
  prGoal: number | null;
  value: number;
  active: boolean;
  activated: boolean;
};

export const PRRing = ({ size, min, prGoal, value, active, activated }: PRRingProps) => {
  const radius = size / 2 - 4,
    cx = size / 2,
    cy = size / 2,
    strokeWidth = active ? 3.5 : 2.5,
    circumference = 2 * Math.PI * radius;
  const empty = !activated && value <= 0;
  const zeroReps = activated && value <= 0;
  const cap = prGoal || min;
  const pct = empty ? 0 : zeroReps ? 0 : Math.min(value / cap, 1);
  const off = circumference - pct * circumference;
  const isPR = !empty && !zeroReps && prGoal && value >= prGoal;
  const aboveMin = !empty && !zeroReps && value > min && !isPR;
  const atMin = !empty && !zeroReps && value === min;
  const underMin = !empty && !zeroReps && value < min;
  const strokeColor = empty
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
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-th-s3)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isPR ? strokeWidth + 1 : strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={empty ? circumference : off}
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
          style={{ fontSize: Math.round(size * 0.28), color: strokeColor }}
        >
          {empty ? min + "+" : value}
        </span>
      </div>
    </div>
  );
};
