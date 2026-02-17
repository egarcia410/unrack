import type { ThemeColors } from "../types";

interface SectionHeaderProps {
  label: string;
  done: boolean;
  collapsed: boolean;
  onToggle: () => void;
  c: ThemeColors;
  extra?: React.ReactNode;
}

export function SectionHeader({ label, done, collapsed, onToggle, c, extra }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: c.t2,
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        boxSizing: "border-box",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 0",
        minHeight: 44,
      }}
    >
      <span>
        {label}
        {done ? " \u2713" : ""}
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {extra}
        <span
          style={{
            fontSize: 11,
            color: c.t4,
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}
        >
          {"\u25BC"}
        </span>
      </div>
    </button>
  );
}
