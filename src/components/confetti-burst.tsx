import { useRef } from "react";
import { CONFETTI_COLORS } from "../constants/theme";

type ConfettiBurstProps = {
  size: number;
};

export const ConfettiBurst = ({ size }: ConfettiBurstProps) => {
  const id = useRef(Math.random().toString(36).slice(2, 6)).current;
  const particles = useRef(
    Array.from({ length: 10 }, (_, particleIndex) => {
      const angle = (particleIndex / 10) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = size * 0.7 + Math.random() * size * 0.5;
      return {
        translateX: Math.round(Math.cos(angle) * dist),
        translateY: Math.round(Math.sin(angle) * dist),
        color: CONFETTI_COLORS[particleIndex % CONFETTI_COLORS.length],
        delay: Math.round(Math.random() * 80),
        size: 3 + Math.round(Math.random() * 3),
      };
    }),
  ).current;
  const css = particles
    .map(
      (particle, particleIndex) =>
        `@keyframes cf${id}${particleIndex}{0%{transform:translate(0,0) scale(1);opacity:1}70%{opacity:1}100%{transform:translate(${particle.translateX}px,${particle.translateY}px) scale(0);opacity:0}}`,
    )
    .join("");
  return (
    <>
      <style>{css}</style>
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {particles.map((particle, particleIndex) => (
          <div
            key={particleIndex}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size > 4 ? "1px" : "50%",
              background: particle.color,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              animation: `cf${id}${particleIndex} 0.65s ${particle.delay}ms ease-out forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};
