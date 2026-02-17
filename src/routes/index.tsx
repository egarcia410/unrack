import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Check, Clock, Settings, Sun, Moon, Minus, Plus } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useWorkoutStore } from "../stores/workout-store";
import { useUIStore, useTheme } from "../stores/ui-store";
import { FN } from "../constants/theme";
import { VARS, LIFTS, LIFT_ORDER } from "../constants/program";
import { AW } from "../constants/exercises";
import { rnd, calcWeight } from "../lib/calc";
import { getAccForLift } from "../lib/exercises";
import { ConfirmModal } from "../components/confirm-modal";
import { Celebration } from "../components/celebration";
import { BottomSheet } from "../components/bottom-sheet";
import { PRRing } from "../components/pr-ring";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { prog, loading } = useProgramStore.getState();
    if (!loading && !prog) throw redirect({ to: "/setup" });
  },
  component: HomePage,
});

function HomePage() {
  const { mode, c } = useTheme();
  const navigate = useNavigate();
  const prog = useProgramStore((s) => s.prog);
  const resetAll = useProgramStore((s) => s.resetAll);
  const swapVariant = useProgramStore((s) => s.swapVariant);
  const toggleUnit = useProgramStore((s) => s.toggleUnit);
  const toggleMode = useProgramStore((s) => s.toggleMode);
  const changeTmPct = useProgramStore((s) => s.changeTmPct);
  const saveE1Edits = useProgramStore((s) => s.saveE1Edits);
  const saveAccEdits = useProgramStore((s) => s.saveAccEdits);
  const advanceWeek = useProgramStore((s) => s.advanceWeek);
  const adjustTmAfterWarn = useProgramStore((s) => s.adjustTmAfterWarn);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const celeb = useUIStore((s) => s.celeb);
  const setCeleb = useUIStore((s) => s.setCeleb);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const setShowConfirm = useUIStore((s) => s.setShowConfirm);
  const showSettings = useUIStore((s) => s.showSettings);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const setShowSettings = useUIStore((s) => s.setShowSettings);
  const showTemplPicker = useUIStore((s) => s.showTemplPicker);
  const setShowTemplPicker = useUIStore((s) => s.setShowTemplPicker);
  const settingsExpanded = useUIStore((s) => s.settingsExpanded);
  const toggleSettingsExpanded = useUIStore((s) => s.toggleSettingsExpanded);
  const editE1 = useUIStore((s) => s.editE1);
  const setEditE1 = useUIStore((s) => s.setEditE1);
  const updateEditE1 = useUIStore((s) => s.updateEditE1);
  const editAcc = useUIStore((s) => s.editAcc);
  const setEditAcc = useUIStore((s) => s.setEditAcc);
  const updateEditAcc = useUIStore((s) => s.updateEditAcc);

  if (!prog) return null;

  const v = VARS[prog.variant],
    wd = v.wk[prog.week];
  const weekDone = prog.wk.filter((w) => w.cy === prog.cycle && w.wk === prog.week);
  const doneLiftIds = weekDone.map((w) => w.lf);

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
  const pillStyle = {
    fontSize: 11,
    fontFamily: FN.m,
    fontWeight: 700,
    color: c.a,
    background: c.ad,
    padding: "4px 12px",
    borderRadius: 100,
    letterSpacing: ".4px",
    textTransform: "uppercase" as const,
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
  const checkStyle = (on: boolean) => ({
    width: 24,
    height: 24,
    borderRadius: 6,
    border: `2px solid ${on ? c.g : c.t4}`,
    background: on ? c.g : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: on ? (mode === "dark" ? "#111" : "#fff") : "transparent",
  });

  const allUsedAccs = () => {
    if (!prog) return [];
    const seen = new Set<string>();
    const result: ReturnType<typeof getAccForLift> = [];
    LIFT_ORDER.forEach((lid) => {
      getAccForLift(lid, prog).forEach((a) => {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          result.push(a);
        }
      });
    });
    return result;
  };

  const handleAdvanceWeek = async () => {
    const result = await advanceWeek();
    if (result.type === "cycle") {
      setCeleb({
        type: "cycle",
        msg: result.msg!,
        sub: result.sub!,
      });
    }
  };

  const handleResetAll = async () => {
    await resetAll();
    setShowConfirm(false);
    navigate({ to: "/setup" });
  };

  return (
    <div style={appStyle}>
      {celeb && (
        <Celebration
          {...celeb}
          c={c}
          onDone={() => setCeleb(null)}
          onAction={
            celeb._lid
              ? async () => {
                  await adjustTmAfterWarn(celeb._lid!, celeb._sugE1!, celeb._sugTM!);
                  setCeleb(null);
                }
              : undefined
          }
        />
      )}
      {showConfirm && (
        <ConfirmModal
          msg="Delete Program?"
          sub="All progress, history and PRs will be permanently lost."
          onYes={handleResetAll}
          onNo={() => setShowConfirm(false)}
          c={c}
          mode={mode}
        />
      )}
      <div style={topBarStyle}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            fontFamily: FN.m,
            color: c.a,
            letterSpacing: "0.5px",
          }}
        >
          unrack
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => navigate({ to: "/history" })} style={iconBtnStyle}>
            <Clock size={18} />
          </button>
          <button onClick={() => setShowSettings(true)} style={iconBtnStyle}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings bottom sheet */}
      {showSettings && (
        <BottomSheet title="Settings" c={c} onClose={closeSettings}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.t3,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              Theme
            </div>
            <button
              onClick={toggleMode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: c.s2,
                border: `1px solid ${c.b}`,
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              <span style={{ color: c.t3, display: "flex" }}>
                {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: c.t3,
                  fontFamily: FN.s,
                }}
              >
                {mode === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: c.t3,
              textTransform: "uppercase",
              letterSpacing: ".5px",
              marginBottom: 8,
            }}
          >
            1 Rep Maxes
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: editE1 ? 12 : 20,
            }}
          >
            {LIFTS.map((l) => {
              const curE1 = editE1 ? parseFloat(editE1[l.id]) || 0 : prog.e1[l.id];
              const derivedTM = curE1 > 0 ? rnd(curE1 * (prog.tmPct / 100)) : 0;
              return (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: c.s2,
                    borderRadius: 8,
                    padding: "8px 12px",
                    minHeight: 44,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: c.t,
                      }}
                    >
                      {l.nm}
                    </span>
                    {derivedTM > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: FN.m,
                          color: c.a,
                          display: "block",
                        }}
                      >
                        TM {derivedTM}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editE1 ? editE1[l.id] || "" : prog.e1[l.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateEditE1((p) => {
                          const prev =
                            p ||
                            Object.fromEntries(
                              Object.entries(prog.e1).map(([k, v]) => [k, String(v)]),
                            );
                          return {
                            ...prev,
                            [l.id]: val,
                          };
                        });
                      }}
                      style={{
                        ...inputStyle,
                        width: 70,
                        padding: "8px 6px",
                        fontSize: 16,
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: c.t4,
                        fontFamily: FN.m,
                      }}
                    >
                      {prog.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {editE1 && (
            <button
              onClick={async () => {
                await saveE1Edits(editE1);
                setEditE1(null);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: c.a,
                color: mode === "dark" ? "#111" : "#fff",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FN.s,
                cursor: "pointer",
                minHeight: 44,
                marginBottom: 20,
              }}
            >
              Save 1RMs
            </button>
          )}

          {allUsedAccs().some((a) => !a.bw) && (
            <>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.t3,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 8,
                }}
              >
                Assistance
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: editAcc ? 12 : 20,
                }}
              >
                {allUsedAccs()
                  .filter((a) => !a.bw)
                  .map((a) => {
                    const wm = prog.accMax?.[a.id] || 0;
                    const curVal = editAcc ? parseFloat(String(editAcc[a.id])) || 0 : wm;
                    const phasePct = (AW[prog.week] || AW[0]).pct;
                    const phaseWt = curVal > 0 ? rnd(curVal * phasePct) : 0;
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: c.s2,
                          borderRadius: 8,
                          padding: "8px 12px",
                          minHeight: 44,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: c.t,
                            }}
                          >
                            {a.nm}
                          </span>
                          {phaseWt > 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: FN.m,
                                color: c.a,
                                display: "block",
                              }}
                            >
                              Phase weight: {phaseWt}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            value={editAcc ? editAcc[a.id] || "" : wm || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateEditAcc((p) => {
                                const base: Record<string, string | number> = {};
                                allUsedAccs()
                                  .filter((x) => !x.bw)
                                  .forEach((x) => {
                                    base[x.id] =
                                      p?.[x.id] !== undefined ? p[x.id] : prog.accMax?.[x.id] || 0;
                                  });
                                return { ...base, [a.id]: val };
                              });
                            }}
                            style={{
                              ...inputStyle,
                              width: 70,
                              padding: "8px 6px",
                              fontSize: 16,
                              fontWeight: 700,
                              textAlign: "right",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: c.t4,
                              fontFamily: FN.m,
                            }}
                          >
                            {prog.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {editAcc && (
                <button
                  onClick={async () => {
                    await saveAccEdits(editAcc);
                    setEditAcc(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: c.a,
                    color: mode === "dark" ? "#111" : "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: FN.s,
                    cursor: "pointer",
                    minHeight: 44,
                    marginBottom: 20,
                  }}
                >
                  Save Assistance
                </button>
              )}
            </>
          )}

          <button
            onClick={toggleSettingsExpanded}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              boxSizing: "border-box",
              background: "none",
              border: "none",
              padding: "8px 0",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.t3,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              Program Settings
            </span>
            <span
              style={{
                fontSize: 11,
                color: c.t4,
                transform: settingsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform .2s",
              }}
            >
              {"\u25BC"}
            </span>
          </button>
          {settingsExpanded && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.t3,
                  letterSpacing: ".3px",
                  marginBottom: 8,
                  marginTop: 4,
                }}
              >
                Units
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {(["lb", "kg"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      if (prog.unit !== u) toggleUnit();
                    }}
                    style={{
                      background: prog.unit === u ? c.ad : c.s2,
                      border: `1px solid ${prog.unit === u ? c.am : c.b}`,
                      borderRadius: 10,
                      padding: "12px",
                      color: prog.unit === u ? c.a : c.t3,
                      fontSize: 14,
                      fontWeight: prog.unit === u ? 700 : 500,
                      fontFamily: FN.s,
                      cursor: "pointer",
                      textAlign: "center",
                      minHeight: 44,
                    }}
                  >
                    {u === "lb" ? "Pounds (lb)" : "Kilograms (kg)"}
                  </button>
                ))}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.t3,
                  letterSpacing: ".3px",
                  marginBottom: 8,
                }}
              >
                Training Max %
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <button
                  onClick={() => changeTmPct(prog.tmPct - 5)}
                  style={{
                    ...iconBtnStyle,
                    width: 48,
                    height: 48,
                    background: c.s2,
                  }}
                >
                  <Minus size={18} />
                </button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      fontFamily: FN.m,
                      color: c.a,
                      lineHeight: 1,
                    }}
                  >
                    {prog.tmPct}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.t3,
                    }}
                  >
                    %
                  </span>
                </div>
                <button
                  onClick={() => changeTmPct(prog.tmPct + 5)}
                  style={{
                    ...iconBtnStyle,
                    width: 48,
                    height: 48,
                    background: c.s2,
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}
          <div
            style={{
              borderTop: `1px solid ${c.b}`,
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <button
              onClick={() => {
                closeSettings();
                setShowConfirm(true);
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 10,
                border: `1px solid ${c.r}30`,
                background: c.rd,
                color: c.r,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: FN.s,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              Delete Program
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Template picker */}
      {showTemplPicker && (
        <BottomSheet title="Template" c={c} onClose={() => setShowTemplPicker(false)}>
          <div style={{ padding: 0 }}>
            {Object.entries(VARS).map(([k, vr]) => {
              const isCurrent = k === prog.variant;
              return (
                <button
                  key={k}
                  onClick={() => swapVariant(k)}
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
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: FN.m,
                        color: c.t3,
                      }}
                    >
                      {vr.d}
                    </span>
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
                      CURRENT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {/* Week overview */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <span style={pillStyle}>Cycle {prog.cycle}</span>
          <span style={{ ...pillStyle, color: c.t3, background: c.s2 }}>{wd.l} Phase</span>
        </div>
        <button
          onClick={() => setShowTemplPicker(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
              color: c.t,
            }}
          >
            {v.n}
          </h1>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={c.t4}
            strokeWidth="2.5"
          >
            <path d="M8 9l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          background: c.s2,
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(weekDone.length / LIFT_ORDER.length) * 100}%`,
            background: c.a,
            borderRadius: 2,
            transition: "width .4s",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: c.t4, marginBottom: 16 }}>
        {weekDone.length} of {LIFT_ORDER.length}
      </div>

      {/* Lift cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 24,
        }}
      >
        {LIFT_ORDER.map((lid, i) => {
          const l = LIFTS.find((x) => x.id === lid)!;
          const isDone = doneLiftIds.includes(lid);
          const amrapSet = wd.s.find((x) => String(x.r).includes("+"));
          const amW = amrapSet ? calcWeight(prog.tms[lid], amrapSet.p) : 0;
          const doneEntry = weekDone.find((w) => w.lf === lid);
          let doneReps = 0;
          if (doneEntry?.am) {
            Object.values(doneEntry.am).forEach((v) => {
              const n = parseInt(v);
              if (n > 0) doneReps = n;
            });
          }
          const prevE1 = doneEntry?.ne1 ? doneEntry.ne1.old : prog.e1[lid];
          const goalR =
            amrapSet && prevE1 ? Math.max(1, Math.ceil((prevE1 / amW - 1) * 30) + 1) : null;
          const minReps = amrapSet ? parseInt(String(amrapSet.r).replace("+", "")) || 1 : 1;

          return (
            <div key={lid + i}>
              <button
                onClick={() => {
                  if (!isDone) {
                    startWorkout(prog.week, i);
                    navigate({ to: "/workout" });
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: isDone ? c.gd : c.s1,
                  border: `1px solid ${isDone ? c.gb : c.b}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontFamily: FN.s,
                  textAlign: "left",
                  cursor: isDone ? "default" : "pointer",
                  width: "100%",
                  boxSizing: "border-box",
                  minHeight: 56,
                }}
              >
                <div style={checkStyle(isDone)}>
                  {isDone && <Check size={13} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: c.t,
                    }}
                  >
                    {l.nm}
                  </span>
                  {isDone && doneEntry && (
                    <div
                      style={{
                        fontSize: 11,
                        color: c.t3,
                        fontFamily: FN.m,
                        marginTop: 2,
                      }}
                    >
                      {new Date(doneEntry.dt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      {doneEntry.dur ? ` \u00B7 ${Math.floor(doneEntry.dur / 60)} min` : ""}
                    </div>
                  )}
                </div>
                {amrapSet && (
                  <PRRing
                    size={36}
                    min={minReps}
                    prGoal={goalR}
                    value={isDone ? doneReps : 0}
                    c={c}
                    active={false}
                    activated={isDone}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Week complete banner */}
      {weekDone.length >= LIFT_ORDER.length &&
        (() => {
          const weekPRs = weekDone.filter((w) => w.ne1).length;
          const v2 = VARS[prog.variant];
          const isLastWeek = prog.week >= v2.wk.length - 1;
          const isDeload = !wd.s.some((s) => String(s.r).includes("+"));
          const nextLabel = isLastWeek
            ? "Start Cycle " + (prog.cycle + 1)
            : "Start " + v2.wk[prog.week + 1].l + " Phase";
          return (
            <div
              style={{
                background: c.ad,
                border: "1px solid " + c.am,
                borderRadius: 14,
                padding: "20px 16px",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: c.a,
                  marginBottom: 4,
                }}
              >
                {wd.l} Complete
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: c.t2,
                  marginBottom: 12,
                }}
              >
                {isDeload
                  ? "Recovery done. Next cycle starts fresh."
                  : weekPRs > 0
                    ? weekPRs + " PR" + (weekPRs > 1 ? "s" : "")
                    : "All lifts logged"}
                {!isDeload && isLastWeek ? " \u2022 Cycle complete!" : ""}
              </div>
              <button onClick={handleAdvanceWeek} style={{ ...btnStyle(true), marginTop: 0 }}>
                {nextLabel}
              </button>
            </div>
          );
        })()}
    </div>
  );
}
