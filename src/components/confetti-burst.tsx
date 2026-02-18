import { useRef } from "react";
import { CONFETTI_COLORS } from "../constants/theme";

interface ConfettiBurstProps {
  size: number;
}

export function ConfettiBurst({ size }: ConfettiBurstProps) {
  const id = useRef(Math.random().toString(36).slice(2, 6)).current;
  const particles = useRef(
    Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = size * 0.7 + Math.random() * size * 0.5;
      return {
        translateX: Math.round(Math.cos(angle) * dist),
        translateY: Math.round(Math.sin(angle) * dist),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.round(Math.random() * 80),
        size: 3 + Math.round(Math.random() * 3),
      };
    }),
  ).current;
  const css = particles
    .map(
      (p, i) =>
        `@keyframes cf${id}${i}{0%{transform:translate(0,0) scale(1);opacity:1}70%{opacity:1}100%{transform:translate(${p.translateX}px,${p.translateY}px) scale(0);opacity:0}}`,
    )
    .join("");
  return (
    <>
      <style>{css}</style>
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.size,
              height: p.size,
              borderRadius: p.size > 4 ? "1px" : "50%",
              background: p.color,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              animation: `cf${id}${i} 0.65s ${p.delay}ms ease-out forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}
