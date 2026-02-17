import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useTheme } from "../stores/ui-store";
import { FN } from "../constants/theme";
import { LIFTS } from "../constants/program";

export const Route = createFileRoute("/history")({
  beforeLoad: () => {
    const { prog, loading } = useProgramStore.getState();
    if (!loading && !prog) throw redirect({ to: "/setup" });
  },
  component: HistoryPage,
});

function HistoryPage() {
  const { c } = useTheme();
  const navigate = useNavigate();
  const prog = useProgramStore((s) => s.prog);

  if (!prog) return null;

  const appStyle = {
    maxWidth: 460,
    margin: "0 auto",
    padding: "12px 16px 80px",
  };
  const topBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0 16px",
    minHeight: 44,
  };
  const iconBtnStyle = {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: c.s1,
    border: `1px solid ${c.b}`,
    borderRadius: 10,
    color: c.t3,
    cursor: "pointer",
  };
  const sectionLbl = {
    fontSize: 11,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: c.t2,
    marginBottom: 10,
  };

  const prRecords = prog.wk.filter((w) => w.ne1).map((w) => ({ ...w.ne1!, dt: w.dt, cy: w.cy }));
  const liftData = LIFTS.map((l) => {
    const prs = prRecords.filter((p) => p.lift === l.id).sort((a, b) => a.dt - b.dt);
    const vals = prs.map((p) => p.nw);
    const current = prog.e1[l.id];
    const first = vals.length > 0 ? vals[0] : current;
    const best = vals.length > 0 ? Math.max(...vals) : current;
    const lastPR = prs.length > 0 ? prs[prs.length - 1] : null;
    return {
      lift: l,
      e1: current,
      gain: current - first,
      best,
      lastPR,
      prCount: prs.length,
    };
  });
  const recent = prog.wk
    .slice(-8)
    .reverse()
    .map((w) => {
      const l = LIFTS.find((x) => x.id === w.lf);
      const amKey = Object.keys(w.am || {}).find((k) => w.am[k] !== undefined && w.am[k] !== "");
      const d = new Date(w.dt);
      return {
        lift: l,
        dayStr: `${d.getMonth() + 1}/${d.getDate()}`,
        amReps: amKey != null ? parseInt(w.am[amKey]) || 0 : null,
        hadPR: !!w.ne1,
        dur: w.dur || 0,
      };
    });

  return (
    <div style={appStyle}>
      <div style={topBarStyle}>
        <button onClick={() => navigate({ to: "/" })} style={iconBtnStyle}>
          <ChevronLeft size={18} />
        </button>
        <div />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 16px" }}>History</h1>
      <div style={sectionLbl}>1RM Progress</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 24,
        }}
      >
        {liftData.map((ld) => (
          <div
            key={ld.lift.id}
            style={{
              background: c.s1,
              border: `1px solid ${c.b}`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, color: c.t }}>{ld.lift.nm}</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: FN.m,
                      color: c.t,
                    }}
                  >
                    {ld.e1}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: c.t4,
                      fontFamily: FN.m,
                    }}
                  >
                    {prog.unit}
                  </span>
                  {ld.gain > 0 && (
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: FN.m,
                        fontWeight: 700,
                        color: c.g,
                      }}
                    >
                      +{ld.gain}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {ld.best > ld.e1 && (
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: FN.m,
                      color: c.t3,
                    }}
                  >
                    Best: <span style={{ fontWeight: 700, color: c.go }}>{ld.best}</span>
                  </div>
                )}
                {ld.prCount > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: FN.m,
                      color: c.t4,
                    }}
                  >
                    {ld.prCount} PR{ld.prCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
            {ld.lastPR && (
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: `1px solid ${c.b}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: c.t3,
                    fontFamily: FN.m,
                  }}
                >
                  Last PR: {ld.lastPR.old} {"\u2192"} {ld.lastPR.nw}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: FN.m,
                    fontWeight: 700,
                    color: c.go,
                  }}
                >
                  {ld.lastPR.w}x{ld.lastPR.reps}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <>
          <div style={sectionLbl}>Recent Workouts</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 24,
            }}
          >
            {recent.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: c.s1,
                  border: `1px solid ${c.b}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  minHeight: 48,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: FN.m,
                    color: c.t4,
                    minWidth: 36,
                  }}
                >
                  {r.dayStr}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: c.t,
                    flex: 1,
                  }}
                >
                  {r.lift?.nm || "?"}
                </span>
                {r.dur > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: FN.m,
                      color: c.t4,
                    }}
                  >
                    {Math.floor(r.dur / 60)}m
                  </span>
                )}
                {r.amReps !== null && (
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: FN.m,
                      fontWeight: 700,
                      color: r.hadPR ? c.go : r.amReps === 0 ? c.r : c.t3,
                    }}
                  >
                    {r.amReps} reps
                  </span>
                )}
                {r.hadPR && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: FN.m,
                      fontWeight: 700,
                      color: c.go,
                      background: c.god,
                      padding: "2px 8px",
                      borderRadius: 100,
                    }}
                  >
                    PR
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
