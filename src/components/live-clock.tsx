import { useState, useEffect } from "react";
import type { ThemeColors } from "../types";
import { FN } from "../constants/theme";

interface LiveClockProps {
  start: number;
  c: ThemeColors;
}

export function LiveClock({ start, c }: LiveClockProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((now - start) / 1000);
  const m = Math.floor(elapsed / 60),
    s = elapsed % 60;
  return (
    <span
      style={{
        fontSize: 15,
        fontFamily: FN.m,
        fontWeight: 600,
        color: c.t3,
        marginLeft: 14,
      }}
    >
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}
