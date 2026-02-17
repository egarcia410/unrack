import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Check, Clock, Settings, Sun, Moon, Minus, Plus } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useWorkoutStore } from "../stores/workout-store";
import { useUIStore, useTheme } from "../stores/ui-store";
import { VARS, LIFTS, LIFT_ORDER } from "../constants/program";
import { AW } from "../constants/exercises";
import { rnd, calcWeight } from "../lib/calc";
import { getAccForLift } from "../lib/exercises";
import { cn } from "../lib/cn";
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
  const { mode } = useTheme();
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
    <div className="max-w-[460px] mx-auto px-4 py-3 pb-20">
      {celeb && (
        <Celebration
          {...celeb}
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
        />
      )}
      <div className="flex justify-between items-center py-2 pb-4 min-h-[44px]">
        <div className="text-[18px] font-extrabold font-mono text-th-a tracking-[0.5px]">
          unrack
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => navigate({ to: "/history" })}
            className="w-[44px] h-[44px] flex items-center justify-center bg-th-s1 border border-th-b rounded-[10px] text-th-t3 cursor-pointer"
          >
            <Clock size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-[44px] h-[44px] flex items-center justify-center bg-th-s1 border border-th-b rounded-[10px] text-th-t3 cursor-pointer"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings bottom sheet */}
      {showSettings && (
        <BottomSheet title="Settings" onClose={closeSettings}>
          <div className="flex justify-between items-center mb-5">
            <div className="text-[12px] font-bold text-th-t3 uppercase tracking-[.5px]">Theme</div>
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 bg-th-s2 border border-th-b rounded-[10px] px-3.5 py-2 cursor-pointer min-h-[44px]"
            >
              <span className="text-th-t3 flex">
                {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </span>
              <span className="text-[13px] font-semibold text-th-t3 font-sans">
                {mode === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>

          <div className="text-[12px] font-bold text-th-t3 uppercase tracking-[.5px] mb-2">
            1 Rep Maxes
          </div>
          <div className={cn("flex flex-col gap-1.5", editE1 ? "mb-3" : "mb-5")}>
            {LIFTS.map((l) => {
              const curE1 = editE1 ? parseFloat(editE1[l.id]) || 0 : prog.e1[l.id];
              const derivedTM = curE1 > 0 ? rnd(curE1 * (prog.tmPct / 100)) : 0;
              return (
                <div
                  key={l.id}
                  className="flex justify-between items-center bg-th-s2 rounded-lg px-3 py-2 min-h-[44px]"
                >
                  <div>
                    <span className="text-[13px] font-semibold text-th-t">{l.nm}</span>
                    {derivedTM > 0 && (
                      <span className="text-[10px] font-mono text-th-a block">TM {derivedTM}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
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
                      className="w-[70px] px-1.5 py-2 text-[16px] font-bold text-right bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border"
                    />
                    <span className="text-[12px] text-th-t4 font-mono">{prog.unit}</span>
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
              className="w-full p-3 rounded-[10px] border-none bg-th-a text-th-inv text-[14px] font-bold font-sans cursor-pointer min-h-[44px] mb-5"
            >
              Save 1RMs
            </button>
          )}

          {allUsedAccs().some((a) => !a.bw) && (
            <>
              <div className="text-[12px] font-bold text-th-t3 uppercase tracking-[.5px] mb-2">
                Assistance
              </div>
              <div className={cn("flex flex-col gap-1.5", editAcc ? "mb-3" : "mb-5")}>
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
                        className="flex justify-between items-center bg-th-s2 rounded-lg px-3 py-2 min-h-[44px]"
                      >
                        <div>
                          <span className="text-[13px] font-semibold text-th-t">{a.nm}</span>
                          {phaseWt > 0 && (
                            <span className="text-[10px] font-mono text-th-a block">
                              Phase weight: {phaseWt}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
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
                            className="w-[70px] px-1.5 py-2 text-[16px] font-bold text-right bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border"
                          />
                          <span className="text-[12px] text-th-t4 font-mono">{prog.unit}</span>
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
                  className="w-full p-3 rounded-[10px] border-none bg-th-a text-th-inv text-[14px] font-bold font-sans cursor-pointer min-h-[44px] mb-5"
                >
                  Save Assistance
                </button>
              )}
            </>
          )}

          <button
            onClick={toggleSettingsExpanded}
            className="flex items-center justify-between w-full box-border bg-none border-none py-2 px-0 cursor-pointer min-h-[44px]"
          >
            <span className="text-[12px] font-bold text-th-t3 uppercase tracking-[.5px]">
              Program Settings
            </span>
            <span
              className={cn(
                "text-[11px] text-th-t4 transition-transform duration-200",
                settingsExpanded ? "rotate-0" : "-rotate-90",
              )}
            >
              {"\u25BC"}
            </span>
          </button>
          {settingsExpanded && (
            <div className="mb-4">
              <div className="text-[12px] font-bold text-th-t3 tracking-[.3px] mb-2 mt-1">
                Units
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["lb", "kg"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      if (prog.unit !== u) toggleUnit();
                    }}
                    className={cn(
                      "rounded-[10px] p-3 text-[14px] font-sans cursor-pointer text-center min-h-[44px]",
                      prog.unit === u
                        ? "bg-th-ad border border-th-am text-th-a font-bold"
                        : "bg-th-s2 border border-th-b text-th-t3 font-medium",
                    )}
                  >
                    {u === "lb" ? "Pounds (lb)" : "Kilograms (kg)"}
                  </button>
                ))}
              </div>
              <div className="text-[12px] font-bold text-th-t3 tracking-[.3px] mb-2">
                Training Max %
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeTmPct(prog.tmPct - 5)}
                  className="w-12 h-12 rounded-[10px] border border-th-b bg-th-s2 text-th-t3 cursor-pointer flex items-center justify-center"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-extrabold font-mono text-th-a leading-none">
                    {prog.tmPct}
                  </span>
                  <span className="text-[16px] font-semibold text-th-t3">%</span>
                </div>
                <button
                  onClick={() => changeTmPct(prog.tmPct + 5)}
                  className="w-12 h-12 rounded-[10px] border border-th-b bg-th-s2 text-th-t3 cursor-pointer flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}
          <div className="border-t border-th-b pt-4 mt-2">
            <button
              onClick={() => {
                closeSettings();
                setShowConfirm(true);
              }}
              className="w-full p-3.5 rounded-[10px] border border-th-r/[0.19] bg-th-rd text-th-r text-[14px] font-semibold font-sans cursor-pointer min-h-[48px]"
            >
              Delete Program
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Template picker */}
      {showTemplPicker && (
        <BottomSheet title="Template" onClose={() => setShowTemplPicker(false)}>
          <div className="p-0">
            {Object.entries(VARS).map(([k, vr]) => {
              const isCurrent = k === prog.variant;
              return (
                <button
                  key={k}
                  onClick={() => swapVariant(k)}
                  className={cn(
                    "flex items-center w-full box-border px-3.5 py-3 rounded-xl text-left min-h-[52px] mb-1 gap-3",
                    isCurrent
                      ? "bg-th-ad border border-th-am cursor-default"
                      : "bg-transparent border border-transparent cursor-pointer",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isCurrent ? "bg-th-a" : "bg-th-t4",
                    )}
                  />
                  <div className="flex-1">
                    <span
                      className={cn(
                        "text-[15px] text-th-t block",
                        isCurrent ? "font-bold" : "font-medium",
                      )}
                    >
                      {vr.n}
                    </span>
                    <span className="text-[11px] font-mono text-th-t3">{vr.d}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold text-th-a">CURRENT</span>
                  )}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {/* Week overview */}
      <div className="mb-4">
        <div className="flex gap-2 mb-1.5">
          <span className="text-[11px] font-mono font-bold text-th-a bg-th-ad px-3 py-1 rounded-full tracking-[.4px] uppercase">
            Cycle {prog.cycle}
          </span>
          <span className="text-[11px] font-mono font-bold text-th-t3 bg-th-s2 px-3 py-1 rounded-full tracking-[.4px] uppercase">
            {wd.l} Phase
          </span>
        </div>
        <button
          onClick={() => setShowTemplPicker(true)}
          className="flex items-center gap-1.5 bg-none border-none p-0 cursor-pointer min-h-[44px]"
        >
          <h1 className="text-2xl font-extrabold m-0 text-th-t">{v.n}</h1>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-th-t4)"
            strokeWidth="2.5"
          >
            <path d="M8 9l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-th-s2 rounded-sm overflow-hidden mb-1">
        <div
          className="h-full bg-th-a rounded-sm transition-[width] duration-400"
          style={{ width: `${(weekDone.length / LIFT_ORDER.length) * 100}%` }}
        />
      </div>
      <div className="text-[12px] text-th-t4 mb-4">
        {weekDone.length} of {LIFT_ORDER.length}
      </div>

      {/* Lift cards */}
      <div className="flex flex-col gap-1.5 mb-6">
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
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3.5 font-sans text-left w-full box-border min-h-[56px]",
                  isDone
                    ? "bg-th-gd border border-th-gb cursor-default"
                    : "bg-th-s1 border border-th-b cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center",
                    isDone
                      ? "border-th-g bg-th-g text-th-inv"
                      : "border-th-t4 bg-transparent text-transparent",
                  )}
                >
                  {isDone && <Check size={13} strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <span className="text-[16px] font-semibold text-th-t">{l.nm}</span>
                  {isDone && doneEntry && (
                    <div className="text-[11px] text-th-t3 font-mono mt-0.5">
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
            <div className="bg-th-ad border border-th-am rounded-[14px] px-4 py-5 mb-6 text-center">
              <div className="text-[18px] font-extrabold text-th-a mb-1">{wd.l} Complete</div>
              <div className="text-[13px] text-th-t2 mb-3">
                {isDeload
                  ? "Recovery done. Next cycle starts fresh."
                  : weekPRs > 0
                    ? weekPRs + " PR" + (weekPRs > 1 ? "s" : "")
                    : "All lifts logged"}
                {!isDeload && isLastWeek ? " \u2022 Cycle complete!" : ""}
              </div>
              <button
                onClick={handleAdvanceWeek}
                className="w-full border-none rounded-xl px-6 py-4 text-[16px] font-bold font-sans cursor-pointer flex items-center justify-center gap-2 min-h-[52px] bg-th-a text-th-inv"
              >
                {nextLabel}
              </button>
            </div>
          );
        })()}
    </div>
  );
}
