import { useState, useEffect, useRef } from "react";
import { ChevronRight, Pause } from "lucide-react";
import type { ThemeColors } from "../types";
import { FN } from "../constants/theme";
import { playTimerDone } from "../lib/audio";

interface RestTimerProps {
  c: ThemeColors;
  dur: number;
  timerKey: number;
  onDismiss: () => void;
  why?: string;
}

export function RestTimer({ c, dur, timerKey, onDismiss, why }: RestTimerProps) {
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
  const barClr = done ? c.g : urgent ? c.y : c.a;
  void barClr;
  const dk = c.bg === "#101012";
  const pct = dur > 0 ? ((dur - left) / dur) * 100 : 100;
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        margin: "0 -16px",
        padding: "14px 20px",
        background: done ? c.g : c.s1,
        borderBottom: `2px solid ${done ? c.gb : c.s3}`,
        transition: "all .3s",
        boxShadow: done ? `0 0 20px ${c.gb}` : `0 4px 12px rgba(0,0,0,0.15)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              fontFamily: FN.m,
              color: done ? (dk ? "#111" : "#fff") : c.t,
              lineHeight: 1,
              animation: done ? "timerPulse 1s infinite" : "",
            }}
          >
            {done ? "GO!" : fmt(left)}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: done ? (dk ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)") : c.t3,
              marginTop: 3,
            }}
          >
            {done ? "Next set ready" : why || "Rest"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {!done && (
            <button
              onClick={() => setPaused(!paused)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "1px solid " + (done ? "transparent" : c.b),
                background: done ? "rgba(0,0,0,0.1)" : c.s2,
                color: done ? (dk ? "#111" : "#fff") : c.t3,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {paused ? <ChevronRight size={18} /> : <Pause size={18} />}
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: "1px solid " + (done ? "transparent" : c.b),
              background: done ? "rgba(0,0,0,0.1)" : c.s2,
              color: done ? (dk ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)") : c.t4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            {"\u00D7"}
          </button>
        </div>
      </div>
      <div
        style={{
          height: 8,
          background: done ? "rgba(0,0,0,0.15)" : c.s3,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: done ? "rgba(0,0,0,0.2)" : urgent ? c.y : c.a,
            borderRadius: 4,
            transition: "width 1s linear",
          }}
        />
      </div>
      <style>{`@keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
