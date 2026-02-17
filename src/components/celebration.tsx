import { useEffect } from "react";
import { Star } from "lucide-react";
import type { ThemeColors } from "../types";

interface CelebrationProps {
  type: "done" | "pr" | "cycle" | "warn";
  msg: string;
  sub: string;
  c: ThemeColors;
  onDone: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionSub?: string;
}

export function Celebration({
  type,
  msg,
  sub,
  c,
  onDone,
  onAction,
  actionLabel,
  actionSub,
}: CelebrationProps) {
  useEffect(() => {
    if (type !== "warn") {
      const t = setTimeout(onDone, 3500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const icon =
    type === "cycle"
      ? String.fromCodePoint(0x1f3c6)
      : type === "pr"
        ? String.fromCodePoint(0x26a1)
        : type === "warn"
          ? String.fromCodePoint(0x26a0)
          : String.fromCodePoint(0x1f4aa);
  const borderColor = type === "warn" ? c.r + "40" : c.b;
  return (
    <div
      onClick={type === "warn" ? undefined : onDone}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        animation: "celebFade .3s",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: "center",
          padding: "36px 28px",
          borderRadius: 20,
          background: c.s1,
          border: `1px solid ${borderColor}`,
          maxWidth: 320,
          width: "90%",
          animation: "celebPop .4s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 6,
            color: type === "warn" ? c.r : c.t,
          }}
        >
          {msg}
        </div>
        <div
          style={{
            fontSize: 13,
            color: c.t2,
            lineHeight: 1.5,
            marginBottom: type === "warn" ? 16 : 0,
          }}
        >
          {sub}
        </div>
        {type === "warn" && onAction && (
          <>
            {actionSub && (
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: c.t3,
                  marginBottom: 12,
                }}
              >
                {actionSub}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onAction}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 10,
                  border: "none",
                  background: c.r,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'DM Sans',system-ui,sans-serif",
                  cursor: "pointer",
                  minHeight: 48,
                }}
              >
                {actionLabel || "Adjust"}
              </button>
              <button
                onClick={onDone}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${c.b}`,
                  background: c.s2,
                  color: c.t3,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'DM Sans',system-ui,sans-serif",
                  cursor: "pointer",
                  minHeight: 48,
                }}
              >
                Keep
              </button>
            </div>
          </>
        )}
        {type === "cycle" && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 5,
              justifyContent: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  color: c.a,
                  animation: `celebStar .4s ${i * 0.08}s both`,
                }}
              >
                <Star size={18} />
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes celebFade{from{opacity:0}to{opacity:1}} @keyframes celebPop{from{opacity:0;transform:scale(.85) translateY(16px)}to{opacity:1;transform:none}} @keyframes celebStar{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
