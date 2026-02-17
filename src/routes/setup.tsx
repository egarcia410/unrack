import { useState } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useProgramStore } from "../stores/program-store";
import { useTheme } from "../stores/ui-store";
import { FN } from "../constants/theme";
import { LIFTS, VARS } from "../constants/program";
import { rnd } from "../lib/calc";

export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    const prog = useProgramStore.getState().prog;
    if (prog) throw redirect({ to: "/" });
  },
  component: SetupPage,
});

function SetupPage() {
  const { mode, c } = useTheme();
  const createProgram = useProgramStore((s) => s.createProgram);
  const navigate = useNavigate();
  const inferredUnit = (
    (typeof navigator !== "undefined" && navigator.language) ||
    "en-US"
  ).startsWith("en-US")
    ? "lb"
    : "kg";

  const [vari, setVari] = useState("fsl");
  const [unit] = useState<"lb" | "kg">(inferredUnit);
  const [orms, setOrms] = useState<Record<string, string>>({
    ohp: "",
    deadlift: "",
    bench: "",
    squat: "",
  });
  const [tmPct] = useState(90);

  const calcTM = (orm: string) => rnd(parseFloat(orm) * (tmPct / 100));
  const allOrmValid = LIFTS.every((l) => parseFloat(orms[l.id]) > 0);

  const appStyle = {
    maxWidth: 460,
    margin: "0 auto",
    padding: "12px 16px 80px",
  };
  const sectionLbl = {
    fontSize: 11,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: c.t2,
    marginBottom: 10,
  };
  const inputStyle = {
    background: c.s2,
    border: `1px solid ${c.bm}`,
    borderRadius: 8,
    color: c.t,
    fontFamily: FN.m,
    fontWeight: 600,
    outline: "none",
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  };
  const btnStyle = (on: boolean) => ({
    width: "100%",
    background: on ? c.a : c.s3,
    color: on ? (mode === "dark" ? "#111" : "#fff") : c.t4,
    border: "none",
    borderRadius: 12,
    padding: "16px 24px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: FN.s,
    cursor: on ? "pointer" : ("not-allowed" as const),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: on ? 1 : 0.35,
    minHeight: 52,
  });

  const handleCreate = async () => {
    await createProgram({ variant: vari, unit, tmPct, orms, mode });
    navigate({ to: "/" });
  };

  return (
    <div style={appStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 0 32px",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            fontFamily: FN.m,
            color: c.a,
            letterSpacing: "0.5px",
          }}
        >
          unrack
        </div>
        <p
          style={{
            color: c.t3,
            fontSize: 13,
            letterSpacing: ".5px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Strength Program
        </p>
      </div>
      <div style={sectionLbl}>Template</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginBottom: 24,
        }}
      >
        {Object.entries(VARS).map(([k, vr]) => {
          const isCurrent = k === vari;
          return (
            <button
              key={k}
              onClick={() => setVari(k)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                background: isCurrent ? c.ad : "transparent",
                border: isCurrent ? `1px solid ${c.am}` : `1px solid transparent`,
                borderRadius: 12,
                cursor: isCurrent ? "default" : "pointer",
                textAlign: "left",
                minHeight: 52,
                marginBottom: 4,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: isCurrent ? c.a : c.t4,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: isCurrent ? 700 : 500,
                    color: c.t,
                    display: "block",
                  }}
                >
                  {vr.n}
                </span>
                <span style={{ fontSize: 11, fontFamily: FN.m, color: c.t3 }}>{vr.d}</span>
              </div>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: FN.m,
                    fontWeight: 700,
                    color: c.a,
                  }}
                >
                  SELECTED
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={sectionLbl}>Enter Your 1 Rep Maxes</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 24,
        }}
      >
        {LIFTS.map((l) => {
          const val = orms[l.id];
          const tm = parseFloat(val) > 0 ? calcTM(val) : 0;
          return (
            <div
              key={l.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: c.s1,
                border: `1px solid ${c.b}`,
                borderRadius: 12,
                padding: "12px 16px",
                minHeight: 56,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.t }}>{l.nm}</div>
                {tm > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: c.a,
                      fontFamily: FN.m,
                    }}
                  >
                    TM = {tm} {unit}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={val}
                  onChange={(e) => setOrms((p) => ({ ...p, [l.id]: e.target.value }))}
                  style={{
                    ...inputStyle,
                    width: 80,
                    padding: "10px 8px",
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: "right",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: c.t4,
                    fontFamily: FN.m,
                  }}
                >
                  {unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleCreate} disabled={!allOrmValid} style={btnStyle(allOrmValid)}>
        Start Program
      </button>
    </div>
  );
}
