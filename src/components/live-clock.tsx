import { useState, useEffect } from "react";

type LiveClockProps = {
  start: number;
};

export const LiveClock = ({ start }: LiveClockProps) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((now - start) / 1000);
  const minutes = Math.floor(elapsed / 60),
    seconds = elapsed % 60;
  return (
    <span className="text-sm font-mono font-semibold text-th-t3 ml-3.5">
      {minutes}:{String(seconds).padStart(2, "0")}
    </span>
  );
};
