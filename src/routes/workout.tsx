import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useWorkoutStore } from "../stores/workout-store";
import { useUIStore, useTheme } from "../stores/ui-store";
import { VARS, LIFTS, LIFT_ORDER } from "../constants/program";
import { EXERCISE_LIB, CATS, CAT_LABELS, CAT_COLORS, AW } from "../constants/exercises";
import { calcWeight, epley, smartRest } from "../lib/calc";
import { getAccForLift, accDiscovered, getRx } from "../lib/exercises";
import { cn } from "../lib/cn";
import { RestTimer } from "../components/rest-timer";
import { LiveClock } from "../components/live-clock";
import { SetRow } from "../components/set-row";
import { SectionHeader } from "../components/section-header";
import { BottomSheet } from "../components/bottom-sheet";
import { PRRing } from "../components/pr-ring";

export const Route = createFileRoute("/workout")({
  beforeLoad: () => {
    const ws = useWorkoutStore.getState();
    if (!ws.workoutStart) throw redirect({ to: "/" });
  },
  component: WorkoutPage,
});

function WorkoutPage() {
  const { mode } = useTheme();
  void mode;
  const navigate = useNavigate();
  const prog = useProgramStore((s) => s.prog);
  const finishWorkout = useProgramStore((s) => s.finishWorkout);
  const swapExercise = useProgramStore((s) => s.swapExercise);
  const setCeleb = useUIStore((s) => s.setCeleb);

  const activeWeek = useWorkoutStore((s) => s.activeWeek);
  const activeDay = useWorkoutStore((s) => s.activeDay);
  const checked = useWorkoutStore((s) => s.checked);
  const amrapReps = useWorkoutStore((s) => s.amrapReps);
  const accLog = useWorkoutStore((s) => s.accLog);
  const accSets = useWorkoutStore((s) => s.accSets);
  const collapsed = useWorkoutStore((s) => s.collapsed);
  const showTimer = useWorkoutStore((s) => s.showTimer);
  const timerInfo = useWorkoutStore((s) => s.timerInfo);
  const timerKey = useWorkoutStore((s) => s.timerKey);
  const swapSlot = useWorkoutStore((s) => s.swapSlot);
  const workoutStart = useWorkoutStore((s) => s.workoutStart);
  const onSetCheck = useWorkoutStore((s) => s.onSetCheck);
  const setAmrapReps = useWorkoutStore((s) => s.setAmrapReps);
  const toggleCollapse = useWorkoutStore((s) => s.toggleCollapse);
  const setAccLog = useWorkoutStore((s) => s.setAccLog);
  const tapAccSet = useWorkoutStore((s) => s.tapAccSet);
  const untapAccSet = useWorkoutStore((s) => s.untapAccSet);
  const dismissTimer = useWorkoutStore((s) => s.dismissTimer);
  const setSwapSlot = useWorkoutStore((s) => s.setSwapSlot);
  const setChecked = useWorkoutStore((s) => s.setChecked);

  if (!prog) return null;

  const v = VARS[prog.variant],
    wd = v.wk[activeWeek];
  const lid = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const lift = LIFTS.find((l) => l.id === lid)!;
  const tm = prog.tms[lid];
  const accs = getAccForLift(lid, prog);

  let supp: Array<{ r: number; p: number; k: string }> = [];
  if (v.sp) for (let i = 0; i < v.sp.n; i++) supp.push({ r: v.sp.r, p: v.sp.p, k: `s${i}` });
  else if (v.spW) {
    const sw = v.spW[activeWeek];
    for (let i = 0; i < sw.n; i++) supp.push({ r: sw.r, p: sw.p, k: `s${i}` });
  } else if (v.fl)
    for (let i = 0; i < v.fl.n; i++) supp.push({ r: v.fl.r, p: wd.s[0].p, k: `s${i}` });
  else if (v.sl)
    for (let i = 0; i < v.sl.n; i++) supp.push({ r: v.sl.r, p: wd.s[1].p, k: `s${i}` });

  const warmup = [
    { r: 5, p: 0.4 },
    { r: 5, p: 0.5 },
    { r: 3, p: 0.6 },
  ];
  const amrapSet = wd.s.find((s) => String(s.r).includes("+"));
  const amrapWeight = amrapSet ? calcWeight(tm, amrapSet.p) : 0;
  const goalReps =
    amrapSet && prog.e1[lid]
      ? Math.max(1, Math.ceil((prog.e1[lid] / amrapWeight - 1) * 30) + 1)
      : null;

  const allWarmup = warmup.every((_, i) => checked[`w${i}`]);
  const allMain = wd.s.every((_, i) => checked[`m${i}`]);
  const allSupp = supp.every((s) => checked[s.k]);
  const allAcc = accs.every((a) => {
    if (!accDiscovered(a, prog)) {
      const log = accLog[a.id];
      const weekRx = AW[activeWeek] || AW[0];
      return (accSets[a.id] || 0) >= weekRx.s && log && parseFloat(log.w || "0") > 0;
    }
    const rx = getRx(a, activeWeek, prog, lid);
    return (accSets[a.id] || 0) >= rx.sets;
  });
  const canFinish = allWarmup && allMain && allSupp && allAcc;
  const isDeload = activeWeek === 3;

  const allSets = [
    ...warmup.map((w, i) => ({
      key: `w${i}`,
      type: "warmup",
      intensity: w.p,
      isDeload,
    })),
    ...wd.s.map((s, i) => ({
      key: `m${i}`,
      type: "main",
      intensity: s.p,
      isDeload,
    })),
    ...supp.map((s) => ({
      key: s.k,
      type: "supp",
      intensity: s.p,
      isDeload,
    })),
    ...accs.map((a) => ({
      key: `a_${a.id}`,
      type: a.bw ? "acc_bw" : "acc_wt",
      intensity: (AW[activeWeek] || AW[0]).pct,
      isDeload,
    })),
  ];

  const handleFinish = async () => {
    const result = await finishWorkout({
      activeWeek,
      activeDay,
      amrapReps,
      accLog,
      accSets,
      workoutStart,
    });
    setCeleb({
      type: result.celebType,
      msg: result.celebMsg,
      sub: result.celebSub,
      actionLabel: result.actionLabel,
      actionSub: result.actionSub,
      _lid: result._lid,
      _sugE1: result._sugE1,
      _sugTM: result._sugTM,
    });
    navigate({ to: "/" });
  };

  return (
    <div>
      <div className="max-w-[460px] mx-auto px-4 py-3 pb-20">
        {/* Swap exercise sheet */}
        {swapSlot && (
          <BottomSheet title="Swap Exercise" onClose={() => setSwapSlot(null)} maxHeight="70vh">
            {CATS.map((cat) => {
              const catColor = CAT_COLORS[cat as keyof typeof CAT_COLORS];
              const exercises = EXERCISE_LIB.filter((e) => e.cat === cat);
              return (
                <div key={cat} className="mb-3">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[.7px] px-1 pt-2 pb-1"
                    style={{ color: catColor }}
                  >
                    {CAT_LABELS[cat]}
                  </div>
                  {exercises.map((e) => {
                    const isCurrent = e.id === swapSlot.currentId;
                    const hasMax = !e.bw && (prog.accMax?.[e.id] || 0) > 0;
                    const rx = getRx(e, activeWeek, prog, swapSlot.liftId);
                    const isNew = !e.bw && !hasMax;
                    return (
                      <button
                        key={e.id}
                        onClick={() => {
                          if (!isCurrent)
                            swapExercise(swapSlot.liftId, swapSlot.slot, e.id).then(() =>
                              setSwapSlot(null),
                            );
                        }}
                        className={cn(
                          "flex items-center w-full box-border px-3 py-2.5 rounded-[10px] text-left min-h-[48px] mb-0.5 gap-2.5",
                          isCurrent
                            ? "bg-th-ad border border-th-am cursor-default"
                            : "bg-transparent border border-transparent cursor-pointer",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            isCurrent ? "bg-th-a" : isNew ? "bg-th-t4" : "bg-th-g",
                          )}
                        />
                        <span
                          className={cn(
                            "flex-1 text-[14px] text-th-t",
                            isCurrent ? "font-bold" : "font-medium",
                          )}
                        >
                          {e.nm}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-th-a">CURRENT</span>
                        )}
                        {!isCurrent && hasMax && (
                          <span className="text-[12px] font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                            {rx.wt} {prog.unit}
                          </span>
                        )}
                        {!isCurrent && isNew && (
                          <span className="text-[10px] font-mono text-th-y bg-th-yd px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </BottomSheet>
        )}

        <div className="flex justify-between items-center py-2 pb-4 min-h-[44px]">
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-[44px] h-[44px] flex items-center justify-center bg-th-s1 border border-th-b rounded-[10px] text-th-t3 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-mono font-bold text-th-a bg-th-ad px-3 py-1 rounded-full tracking-[.4px] uppercase">
            C{prog.cycle} {wd.t}
          </span>
        </div>

        {showTimer && (
          <RestTimer
            dur={timerInfo.dur}
            timerKey={timerKey}
            onDismiss={dismissTimer}
            why={timerInfo.why}
          />
        )}

        <div className="text-center py-1 pb-5">
          <h1 className="text-[28px] font-extrabold my-0.5 tracking-tight">{lift.nm}</h1>
          <div className="flex justify-center gap-3.5">
            <span className="text-[14px] font-mono text-th-a font-semibold">TM {tm}</span>
            <span className="text-[14px] font-mono text-th-t3">1RM {prog.e1[lid]}</span>
          </div>
        </div>

        {/* Warm-up */}
        <SectionHeader
          label="Warm-up"
          done={allWarmup}
          collapsed={!!collapsed.warmup}
          onToggle={() => toggleCollapse("warmup")}
        />
        {!collapsed.warmup && (
          <div className="flex flex-col gap-1 mb-6">
            {warmup.map((w, i) => {
              const k = `w${i}`;
              return (
                <SetRow
                  key={k}
                  done={!!checked[k]}
                  weight={calcWeight(tm, w.p)}
                  unit={prog.unit}
                  reps={w.r}
                  pct={w.p}
                  onClick={() => onSetCheck(k, allSets)}
                />
              );
            })}
          </div>
        )}

        {/* Working Sets */}
        <SectionHeader
          label="Working Sets"
          done={allMain}
          collapsed={!!collapsed.main}
          onToggle={() => toggleCollapse("main")}
        />
        {!collapsed.main && (
          <div className="flex flex-col gap-1 mb-6">
            {wd.s.map((set, i) => {
              const k = `m${i}`;
              const d = checked[k];
              const isA = String(set.r).includes("+");

              if (isA) {
                const minR = parseInt(String(set.r).replace("+", "")) || 1;
                const amDone = !!checked[k];
                const entered = parseInt(amrapReps[k]) || 0;
                const curE1 = entered > 0 ? epley(amrapWeight, entered) : 0;
                const prevE1Val = prog.e1[lid] || 0;
                const isPR = amDone && entered > 0 && goalReps && entered >= goalReps;
                const activateAmrap = () => {
                  if (!amDone) {
                    setChecked((p) => ({ ...p, [k]: true }));
                    setAmrapReps((p) => ({
                      ...p,
                      [k]: String(minR),
                    }));
                    const amIdx = allSets.findIndex((s) => s.key === k);
                    let ns: (typeof allSets)[number] | null = null;
                    for (let j = amIdx + 1; j < allSets.length; j++) {
                      if (!checked[allSets[j].key]) {
                        ns = allSets[j];
                        break;
                      }
                    }
                    if (ns) {
                      useWorkoutStore.setState({
                        timerInfo: smartRest(ns.type, ns.intensity || 0, ns.isDeload || false),
                        showTimer: true,
                        timerKey: useWorkoutStore.getState().timerKey + 1,
                      });
                    }
                  }
                };
                const stepDown = () => {
                  if (!amDone) return;
                  const nv = Math.max(0, (parseInt(amrapReps[k]) || 0) - 1);
                  setAmrapReps((p) => ({
                    ...p,
                    [k]: String(nv),
                  }));
                };
                const stepUp = () => {
                  if (!amDone) {
                    activateAmrap();
                    return;
                  }
                  setAmrapReps((p) => ({
                    ...p,
                    [k]: String((parseInt(p[k]) || 0) + 1),
                  }));
                };

                const borderClr = !amDone
                  ? "var(--color-th-t4)"
                  : entered <= 0
                    ? "var(--color-th-r)"
                    : isPR
                      ? "var(--color-th-go)"
                      : entered > minR
                        ? "var(--color-th-pr)"
                        : entered === minR
                          ? "var(--color-th-g)"
                          : entered < minR
                            ? "var(--color-th-r)"
                            : "var(--color-th-g)";

                return (
                  <div key={k}>
                    <div
                      className={cn(
                        "rounded-[14px] p-4 transition-all duration-[250ms]",
                        isPR ? "bg-th-god animate-gold-glow" : "bg-th-s1",
                      )}
                      style={{ border: `2px solid ${borderClr}` }}
                    >
                      {!amDone ? (
                        <button
                          onClick={activateAmrap}
                          className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer min-h-[56px]"
                        >
                          <div>
                            <span className="text-[22px] font-extrabold font-mono text-th-t">
                              {amrapWeight}
                            </span>
                            <span className="text-[13px] text-th-t4 font-mono font-semibold">
                              {" "}
                              {prog.unit}
                            </span>
                            {goalReps && (
                              <div className="text-[12px] text-th-t4 font-mono mt-1">
                                PR at <span className="text-th-go font-bold">{goalReps}+</span>
                              </div>
                            )}
                          </div>
                          <PRRing
                            size={58}
                            min={minR}
                            prGoal={goalReps}
                            value={0}
                            active={true}
                            activated={false}
                          />
                        </button>
                      ) : (
                        <div>
                          <div className="text-[13px] text-th-t4 font-mono mb-2 text-center">
                            {amrapWeight} {prog.unit}
                            {goalReps ? ` \u00B7 PR at ${goalReps}+` : ""}
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={stepDown}
                              className="w-12 h-12 rounded-[10px] border border-th-b bg-th-s2 text-th-t3 cursor-pointer flex items-center justify-center text-[20px] font-bold font-mono"
                            >
                              {"\u2212"}
                            </button>
                            <PRRing
                              size={80}
                              min={minR}
                              prGoal={goalReps}
                              value={entered}
                              active={true}
                              activated={true}
                            />
                            <button
                              onClick={stepUp}
                              className="w-12 h-12 rounded-[10px] border border-th-b bg-th-s2 text-th-t3 cursor-pointer flex items-center justify-center text-[20px] font-bold font-mono"
                            >
                              +
                            </button>
                          </div>
                          {isPR && curE1 > 0 && (
                            <div className="text-[14px] font-mono font-extrabold mt-2.5 text-th-go text-center">
                              PR {prevE1Val} {"\u2192"} {curE1} {prog.unit}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <SetRow
                  key={k}
                  done={!!d}
                  weight={calcWeight(tm, set.p)}
                  unit={prog.unit}
                  reps={set.r}
                  pct={set.p}
                  onClick={() => onSetCheck(k, allSets)}
                />
              );
            })}
          </div>
        )}

        {/* Supplemental */}
        {supp.length > 0 && (
          <>
            <SectionHeader
              label="Supplemental"
              done={allSupp}
              collapsed={!!collapsed.supp}
              onToggle={() => toggleCollapse("supp")}
              extra={
                <span className="text-th-t4">
                  {prog.variant === "bbb" || prog.variant === "bbbC"
                    ? "BBB"
                    : prog.variant === "fsl"
                      ? "FSL"
                      : "SSL"}
                </span>
              }
            />
            {!collapsed.supp && (
              <div className="flex flex-col gap-1 mb-6">
                {supp.map((s) => (
                  <SetRow
                    key={s.k}
                    done={!!checked[s.k]}
                    weight={calcWeight(tm, s.p)}
                    unit={prog.unit}
                    reps={s.r}
                    pct={s.p}
                    onClick={() => onSetCheck(s.k, allSets)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Assistance */}
        <SectionHeader
          label="Assistance"
          done={allAcc}
          collapsed={!!collapsed.acc}
          onToggle={() => toggleCollapse("acc")}
        />
        {!collapsed.acc && (
          <div className="flex flex-col gap-1.5 mb-6">
            {accs.map((a) => {
              const discovered = accDiscovered(a, prog);
              const log = accLog[a.id] || {};

              if (discovered) {
                const rx = getRx(a, activeWeek, prog, lid);
                const done = (accSets[a.id] || 0) >= rx.sets;
                const setsDone = accSets[a.id] || 0;
                const rxText =
                  rx.type === "bw"
                    ? `${rx.sets}\u00D7${rx.reps}`
                    : `${rx.sets}\u00D7${rx.reps}${rx.wt && rx.wt > 0 ? " @ " + rx.wt + " " + prog.unit : ""}`;

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-xl px-3.5 py-3 transition-all duration-150",
                      done ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-b",
                    )}
                  >
                    <button
                      onClick={() =>
                        setSwapSlot({
                          liftId: lid,
                          slot: a.slot!,
                          currentId: a.id,
                        })
                      }
                      className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-2.5 min-h-[44px]"
                    >
                      <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                        <span className="text-[15px] font-semibold text-th-t">{a.nm}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-th-t4)"
                          strokeWidth="2.5"
                          className="shrink-0"
                        >
                          <path d="M8 9l4 4 4-4" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-mono font-semibold text-th-t3 shrink-0 ml-2">
                        {rxText}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: rx.sets }, (_, si) => {
                        const filled = si < setsDone;
                        const isNext = si === setsDone;
                        const isLast = si === setsDone - 1;
                        return (
                          <button
                            key={si}
                            onClick={
                              isNext
                                ? () =>
                                    tapAccSet(
                                      a.id,
                                      rx.sets,
                                      a.bw ? "acc_bw" : "acc_wt",
                                      (AW[activeWeek] || AW[0]).pct,
                                      isDeload,
                                    )
                                : isLast
                                  ? () => untapAccSet(a.id, rx.sets)
                                  : undefined
                            }
                            className={cn(
                              "w-[44px] h-[44px] rounded-lg border-2 flex items-center justify-center transition-all duration-150",
                              filled
                                ? "border-th-g bg-th-g text-th-inv"
                                : isNext
                                  ? "border-th-t3 bg-th-s2 text-th-t4"
                                  : "border-th-t4 bg-th-s2 text-th-t4",
                              isNext || isLast ? "cursor-pointer" : "cursor-default",
                              isNext || filled ? "opacity-100" : "opacity-35",
                            )}
                          >
                            {filled && <Check size={13} strokeWidth={3} />}
                            {!filled && isNext && (
                              <span className="text-[13px] font-bold font-mono text-th-t3">
                                {si + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <span className="text-[12px] font-mono text-th-t3 ml-1">
                        {setsDone}/{rx.sets}
                      </span>
                    </div>
                  </div>
                );
              }

              // Undiscovered accessory
              const weekRx = AW[activeWeek] || AW[0];
              const hasWeight = parseFloat(log.w || "0") > 0;
              const ftSetsDone = accSets[a.id] || 0;
              const ftAllSets = ftSetsDone >= weekRx.s;
              const ftComplete = ftAllSets && (a.bw || hasWeight);

              return (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-xl px-3.5 py-3 transition-all duration-150",
                    ftComplete ? "bg-th-gd border border-th-gb" : "bg-th-s1 border border-th-yb",
                  )}
                >
                  <button
                    onClick={() =>
                      setSwapSlot({
                        liftId: lid,
                        slot: a.slot!,
                        currentId: a.id,
                      })
                    }
                    className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-1 min-h-[44px]"
                  >
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                      <span className="text-[15px] font-semibold text-th-t">{a.nm}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-th-t4)"
                        strokeWidth="2.5"
                        className="shrink-0"
                      >
                        <path d="M8 9l4 4 4-4" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-th-y shrink-0 ml-2">
                      {weekRx.s}
                      {"\u00D7"}
                      {weekRx.r}
                    </span>
                  </button>
                  <div className="text-[12px] text-th-t3 mb-2.5">
                    {a.bw
                      ? "Max reps with good form each set."
                      : "Same weight all " + weekRx.s + " sets. Leave 1\u20132 reps in the tank."}
                  </div>
                  {!a.bw && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[13px] font-semibold text-th-t">Weight:</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={log.w || ""}
                        onChange={(e) => {
                          setAccLog((p) => ({
                            ...p,
                            [a.id]: { w: e.target.value },
                          }));
                          const v = parseFloat(e.target.value) > 0;
                          if (v && ftAllSets)
                            setChecked((p) => ({
                              ...p,
                              [`a_${a.id}`]: true,
                            }));
                          else
                            setChecked((p) => {
                              const n = { ...p };
                              delete n[`a_${a.id}`];
                              return n;
                            });
                        }}
                        className="w-[90px] px-2 py-2.5 text-[18px] font-bold bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border text-center"
                      />
                      <span className="text-[13px] text-th-t4 font-mono">{prog.unit}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: weekRx.s }, (_, si) => {
                      const filled = si < ftSetsDone;
                      const isNext = si === ftSetsDone;
                      const isLast = si === ftSetsDone - 1;
                      return (
                        <button
                          key={si}
                          onClick={
                            isNext
                              ? () => {
                                  tapAccSet(
                                    a.id,
                                    weekRx.s,
                                    a.bw ? "acc_bw" : "acc_wt",
                                    weekRx.pct,
                                    isDeload,
                                  );
                                  if (ftSetsDone + 1 >= weekRx.s && (a.bw || hasWeight)) {
                                    setChecked((p) => ({
                                      ...p,
                                      [`a_${a.id}`]: true,
                                    }));
                                  }
                                }
                              : isLast
                                ? () => untapAccSet(a.id, weekRx.s)
                                : undefined
                          }
                          className={cn(
                            "w-[44px] h-[44px] rounded-lg border-2 flex items-center justify-center transition-all duration-150",
                            filled
                              ? "border-th-g bg-th-g text-th-inv"
                              : isNext
                                ? "border-th-t3 bg-th-s2 text-th-t4"
                                : "border-th-t4 bg-th-s2 text-th-t4",
                            isNext || isLast ? "cursor-pointer" : "cursor-default",
                            isNext || filled ? "opacity-100" : "opacity-35",
                          )}
                        >
                          {filled && <Check size={13} strokeWidth={3} />}
                          {!filled && isNext && (
                            <span className="text-[13px] font-bold font-mono text-th-t3">
                              {si + 1}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <span className="text-[12px] font-mono text-th-t3 ml-1">
                      {ftSetsDone}/{weekRx.s}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-[70px]" />
      </div>

      {/* Bottom bar */}
      {(() => {
        let accSetsDone = 0,
          accSetsTotal = 0;
        accs.forEach((a) => {
          const disc = accDiscovered(a, prog);
          const rx = disc ? getRx(a, activeWeek, prog, lid) : { sets: (AW[activeWeek] || AW[0]).s };
          accSetsTotal += rx.sets;
          accSetsDone += accSets[a.id] || 0;
        });
        const warmupDone = warmup.filter((_, i) => checked[`w${i}`]).length;
        const mainDone = wd.s.filter((_, i) => checked[`m${i}`]).length;
        const suppDone = supp.filter((s) => checked[s.k]).length;
        const done = warmupDone + mainDone + suppDone + accSetsDone;
        const total = warmup.length + wd.s.length + supp.length + accSetsTotal;

        return (
          <div className="fixed bottom-0 left-0 right-0 z-20 transition-all duration-300">
            <div
              className={cn(
                "max-w-[460px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.1)]",
                canFinish
                  ? "p-0 bg-th-g border-t border-th-gb"
                  : "px-5 py-4 bg-th-s1 border-t border-th-b",
              )}
            >
              {canFinish ? (
                <button
                  onClick={handleFinish}
                  className="w-full px-5 py-[18px] bg-none border-none cursor-pointer flex items-center justify-center gap-2 font-sans"
                >
                  <Check size={13} strokeWidth={3} />
                  <span className="text-[17px] font-bold text-th-inv">Complete Workout</span>
                </button>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-[15px] font-mono font-bold text-th-t shrink-0">
                      {done}/{total}
                    </span>
                    <div className="flex-1 h-1.5 bg-th-s3 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-th-a rounded-sm transition-[width] duration-300"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                  {workoutStart && <LiveClock start={workoutStart} />}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
