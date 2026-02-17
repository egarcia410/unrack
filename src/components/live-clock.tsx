import { useState, useEffect } from "react";

interface LiveClockProps {
  start: number;
}

export function LiveClock({ start }: LiveClockProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((now - start) / 1000);
  const m = Math.floor(elapsed / 60),
    s = elapsed % 60;
  return (
    <span className="text-[15px] font-mono font-semibold text-th-t3 ml-3.5">
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}
