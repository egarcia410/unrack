import { useState, useEffect, useRef } from "react";
import type { ThemeColors } from "../types";
import { FN } from "../constants/theme";
import { ConfettiBurst } from "./confetti-burst";

interface PRRingProps {
  size: number;
  min: number;
  prGoal: number | null;
  value: number;
  c: ThemeColors;
  active: boolean;
  activated: boolean;
}

export function PRRing({ size, min, prGoal, value, c, active, activated }: PRRingProps) {
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
    ? c.t4
    : zeroReps
      ? c.r
      : isPR
        ? c.go
        : aboveMin
          ? c.pr
          : atMin
            ? c.g
            : underMin
              ? c.r
              : c.g;
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
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.s3} strokeWidth={sw} />
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
          style={{
            transition: "stroke-dashoffset .4s,stroke .3s",
          }}
        />
      </svg>
      {isPR && (
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            animation: "gold-glow 1.5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      {showConfetti && active && <ConfettiBurst size={size} />}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: Math.round(size * 0.28),
            fontWeight: 800,
            fontFamily: FN.m,
            color: clr,
            lineHeight: 1,
          }}
        >
          {empty ? min + "+" : value}
        </span>
      </div>
    </div>
  );
}
