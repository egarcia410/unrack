import { Check } from "lucide-react";
import type { ThemeColors, ThemeMode } from "../types";
import { FN } from "../constants/theme";

interface SetRowProps {
  done: boolean;
  weight: number;
  unit: string;
  reps: number | string;
  pct: number;
  isAmrap?: boolean;
  onClick: () => void;
  c: ThemeColors;
  mode: ThemeMode;
}

export function SetRow({ done, weight, unit, reps, pct, isAmrap, onClick, c, mode }: SetRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr auto 42px",
        alignItems: "center",
        gap: 8,
        padding: "12px 14px",
        background: done ? c.gd : c.s1,
        border: `1px solid ${done ? c.gb : isAmrap ? c.yb : c.b}`,
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: FN.s,
        textAlign: "left",
        width: "100%",
        boxSizing: "border-box",
        transition: "all .12s",
        minHeight: 52,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: `2px solid ${done ? c.g : c.t4}`,
          background: done ? c.g : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: done ? (mode === "dark" ? "#111" : "#fff") : "transparent",
        }}
      >
        {done && <Check size={13} strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, fontFamily: FN.m, color: c.t }}>
        {weight} <span style={{ fontSize: 12, color: c.t4 }}>{unit}</span>
      </span>
      <span style={{ fontSize: 14, fontFamily: FN.m, color: c.t3 }}>x{reps}</span>
      <span
        style={{
          fontSize: 11,
          fontFamily: FN.m,
          color: c.t4,
          textAlign: "right",
        }}
      >
        {Math.round(pct * 100)}%
      </span>
    </button>
  );
}
