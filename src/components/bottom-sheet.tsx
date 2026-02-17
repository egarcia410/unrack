import type { ReactNode } from "react";
import type { ThemeColors } from "../types";

interface BottomSheetProps {
  title: string;
  c: ThemeColors;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ title, c, onClose, children, maxHeight = "85vh" }: BottomSheetProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.s1,
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 460,
          maxHeight,
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .2s ease-out",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: `1px solid ${c.b}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: c.t }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: `1px solid ${c.b}`,
              background: c.s2,
              color: c.t4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {"\u00D7"}
          </button>
        </div>
        <div style={{ padding: "16px 20px 24px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
      <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
