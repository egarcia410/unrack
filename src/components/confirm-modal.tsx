import type { ThemeColors, ThemeMode } from "../types";
import { FN } from "../constants/theme";

interface ConfirmModalProps {
  msg: string;
  sub: string;
  onYes: () => void;
  onNo: () => void;
  c: ThemeColors;
  mode: ThemeMode;
  yesLabel?: string;
}

export function ConfirmModal({ msg, sub, onYes, onNo, c, mode, yesLabel }: ConfirmModalProps) {
  return (
    <div
      onClick={onNo}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.s1,
          border: `1px solid ${c.b}`,
          borderRadius: 16,
          padding: 24,
          maxWidth: 320,
          width: "85%",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: c.t,
            marginBottom: 6,
          }}
        >
          {msg}
        </div>
        <div
          style={{
            fontSize: 13,
            color: c.t3,
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onNo}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 10,
              border: `1px solid ${c.b}`,
              background: c.s2,
              color: c.t,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: FN.s,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onYes}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 10,
              border: "none",
              background: c.r,
              color: mode === "dark" ? "#111" : "#fff",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: FN.s,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            {yesLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
