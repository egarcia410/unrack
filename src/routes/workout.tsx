import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useWorkoutStore, hasActiveWorkout } from "../stores/workout-store";
import { useUIStore } from "../stores/ui-store";
import { TEMPLATES, LIFTS, LIFT_ORDER } from "../constants/program";
import {
  EXERCISE_LIB,
  CATS,
  CAT_LABELS,
  CAT_COLORS,
  ASSISTANCE_WEEKS,
} from "../constants/exercises";
import { calcWeight, epley } from "../lib/calc";
import {
  getAssistanceForLift,
  isAssistanceDiscovered,
  getAssistancePrescription,
} from "../lib/exercises";
import { cn } from "../lib/cn";
import { RestTimer } from "../components/rest-timer";
import { LiveClock } from "../components/live-clock";
import { SetRow } from "../components/set-row";
import { SectionHeader } from "../components/section-header";
import { Drawer } from "../components/drawer";
import { PRRing } from "../components/pr-ring";
import { WeightInput } from "../components/weight-input";
import type { SetType } from "../types";

export const Route = createFileRoute("/workout")({
  beforeLoad: () => {
    if (!hasActiveWorkout()) throw redirect({ to: "/" });
  },
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
  const prog = useProgramStore();
  const { workoutFinished, exerciseSwapped } = useProgramStore.actions();
  const { setCeleb } = useUIStore.actions();

  const activeWeek = useWorkoutStore.activeWeek();
  const activeDay = useWorkoutStore.activeDay();
  const checked = useWorkoutStore.checked();
  const amrapReps = useWorkoutStore.amrapReps();
  const accLog = useWorkoutStore.accLog();
  const accSets = useWorkoutStore.accSets();
  const collapsed = useWorkoutStore.collapsed();
  const showTimer = useWorkoutStore.showTimer();
  const timerInfo = useWorkoutStore.timerInfo();
  const timerKey = useWorkoutStore.timerKey();
  const swapSlot = useWorkoutStore.swapSlot();
  const workoutStart = useWorkoutStore.workoutStart();
  const {
    onSetCheck,
    setAmrapReps,
    toggleCollapse,
    setAccLog,
    tapAccSet,
    untapAccSet,
    dismissTimer,
    setSwapSlot,
    setChecked,
    activateTimer,
  } = useWorkoutStore.actions();

  const variant = TEMPLATES[prog.template],
    weekDef = variant.weeks[activeWeek];
  const liftId = LIFT_ORDER[activeDay % LIFT_ORDER.length];
  const lift = LIFTS.find((l) => l.id === liftId)!;
  const tm = prog.trainingMaxes[liftId];
  const accs = getAssistanceForLift(liftId, prog);

  let supp: Array<{ reps: number; percentage: number; key: string }> = [];
  if (variant.supplemental)
    for (let i = 0; i < variant.supplemental.numSets; i++)
      supp.push({
        reps: variant.supplemental.reps,
        percentage: variant.supplemental.percentage,
        key: `s${i}`,
      });
  else if (variant.supplementalWeekly) {
    const weeklySupp = variant.supplementalWeekly[activeWeek];
    for (let i = 0; i < weeklySupp.numSets; i++)
      supp.push({ reps: weeklySupp.reps, percentage: weeklySupp.percentage, key: `s${i}` });
  } else if (variant.firstSetLast)
    for (let i = 0; i < variant.firstSetLast.numSets; i++)
      supp.push({
        reps: variant.firstSetLast.reps,
        percentage: weekDef.sets[0].percentage,
        key: `s${i}`,
      });
  else if (variant.secondSetLast)
    for (let i = 0; i < variant.secondSetLast.numSets; i++)
      supp.push({
        reps: variant.secondSetLast.reps,
        percentage: weekDef.sets[1].percentage,
        key: `s${i}`,
      });

  const warmup = [
    { reps: 5, percentage: 0.4 },
    { reps: 5, percentage: 0.5 },
    { reps: 3, percentage: 0.6 },
  ];
  const amrapSet = weekDef.sets.find((s) => String(s.reps).includes("+"));
  const amrapWeight = amrapSet ? calcWeight(tm, amrapSet.percentage) : 0;
  const goalReps =
    amrapSet && prog.oneRepMaxes[liftId]
      ? Math.max(1, Math.ceil((prog.oneRepMaxes[liftId] / amrapWeight - 1) * 30) + 1)
      : null;

  const allWarmup = warmup.every((_, i) => checked[`w${i}`]);
  const allMain = weekDef.sets.every((_, i) => checked[`m${i}`]);
  const allSupp = supp.every((s) => checked[s.key]);
  const allAcc = accs.every((a) => {
    if (!isAssistanceDiscovered(a, prog)) {
      const log = accLog[a.id];
      const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
      return (accSets[a.id] || 0) >= weekRx.sets && log && parseFloat(log.w || "0") > 0;
    }
    const rx = getAssistancePrescription(a, activeWeek, prog, liftId);
    return (accSets[a.id] || 0) >= rx.sets;
  });
  const canFinish = allWarmup && allMain && allSupp && allAcc;
  const isDeload = activeWeek === 3;

  const allSets: Array<{ key: string; type: SetType; intensity: number; isDeload: boolean }> = [
    ...warmup.map((w, i) => ({
      key: `w${i}`,
      type: "warmup" as SetType,
      intensity: w.percentage,
      isDeload,
    })),
    ...weekDef.sets.map((s, i) => ({
      key: `m${i}`,
      type: "main" as SetType,
      intensity: s.percentage,
      isDeload,
    })),
    ...supp.map((s) => ({
      key: s.key,
      type: "supp" as SetType,
      intensity: s.percentage,
      isDeload,
    })),
    ...accs.map((a) => ({
      key: `a_${a.id}`,
      type: (a.isBodyweight ? "acc_bw" : "acc_wt") as SetType,
      intensity: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).percentage,
      isDeload,
    })),
  ];

  const handleFinish = async () => {
    const result = await workoutFinished({
      activeWeek,
      activeDay,
      amrapReps,
      accLog,
      accSets,
      workoutStart,
    });
    setCeleb({
      type: result.celebType,
      message: result.celebMsg,
      subtitle: result.celebSub,
      actionLabel: result.actionLabel,
      actionSub: result.actionSub,
      _liftId: result._liftId,
      _suggestedOneRepMax: result._suggestedOneRepMax,
      _suggestedTrainingMax: result._suggestedTrainingMax,
    });
    navigate({ to: "/" });
  };

  return (
    <div>
      <div className="max-w-[460px] mx-auto px-4 py-3 pb-20">
        {/* Swap exercise sheet */}
        <Drawer
          open={!!swapSlot}
          onOpenChange={(open) => {
            if (!open) setSwapSlot(null);
          }}
          title="Swap Exercise"
        >
          {swapSlot &&
            CATS.map((cat) => {
              const catColor = CAT_COLORS[cat as keyof typeof CAT_COLORS];
              const exercises = EXERCISE_LIB.filter((e) => e.category === cat);
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
                    const hasMax = !e.isBodyweight && (prog.assistanceMaximums?.[e.id] || 0) > 0;
                    const rx = getAssistancePrescription(e, activeWeek, prog, swapSlot.liftId);
                    const isNew = !e.isBodyweight && !hasMax;
                    return (
                      <button
                        key={e.id}
                        onClick={() => {
                          if (!isCurrent)
                            exerciseSwapped(swapSlot.liftId, swapSlot.slot, e.id).then(() =>
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
                          {e.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-th-a">CURRENT</span>
                        )}
                        {!isCurrent && hasMax && (
                          <span className="text-[12px] font-mono font-bold text-th-pr bg-th-prd px-2.5 py-0.5 rounded-full">
                            {rx.weight} {prog.unit}
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
        </Drawer>

        <div className="flex justify-between items-center py-2 pb-4 min-h-[44px]">
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-[44px] h-[44px] flex items-center justify-center bg-th-s1 border border-th-b rounded-[10px] text-th-t3 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-mono font-bold text-th-a bg-th-ad px-3 py-1 rounded-full tracking-[.4px] uppercase">
            C{prog.cycle} {weekDef.title}
          </span>
        </div>

        {showTimer && (
          <RestTimer
            duration={timerInfo.duration}
            timerKey={timerKey}
            onDismiss={dismissTimer}
            reason={timerInfo.reason}
          />
        )}

        <div className="text-center py-1 pb-5">
          <h1 className="text-[28px] font-extrabold my-0.5 tracking-tight">{lift.name}</h1>
          <div className="flex justify-center gap-3.5">
            <span className="text-[14px] font-mono text-th-a font-semibold">TM {tm}</span>
            <span className="text-[14px] font-mono text-th-t3">1RM {prog.oneRepMaxes[liftId]}</span>
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
                  weight={calcWeight(tm, w.percentage)}
                  unit={prog.unit}
                  reps={w.reps}
                  pct={w.percentage}
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
            {weekDef.sets.map((set, i) => {
              const k = `m${i}`;
              const done = checked[k];
              const isAmrap = String(set.reps).includes("+");

              if (isAmrap) {
                const minReps = parseInt(String(set.reps).replace("+", "")) || 1;
                const amDone = !!checked[k];
                const entered = parseInt(amrapReps[k]) || 0;
                const curE1 = entered > 0 ? epley(amrapWeight, entered) : 0;
                const prevE1Val = prog.oneRepMaxes[liftId] || 0;
                const isPR = amDone && entered > 0 && goalReps && entered >= goalReps;
                const activateAmrap = () => {
                  if (!amDone) {
                    setChecked((p) => ({ ...p, [k]: true }));
                    setAmrapReps((p) => ({
                      ...p,
                      [k]: String(minReps),
                    }));
                    const amIdx = allSets.findIndex((s) => s.key === k);
                    let nextSet: (typeof allSets)[number] | null = null;
                    for (let j = amIdx + 1; j < allSets.length; j++) {
                      if (!checked[allSets[j].key]) {
                        nextSet = allSets[j];
                        break;
                      }
                    }
                    if (nextSet) {
                      activateTimer(
                        nextSet.type,
                        nextSet.intensity || 0,
                        nextSet.isDeload || false,
                      );
                    }
                  }
                };
                const stepDown = () => {
                  if (!amDone) return;
                  const newVal = Math.max(0, (parseInt(amrapReps[k]) || 0) - 1);
                  setAmrapReps((p) => ({
                    ...p,
                    [k]: String(newVal),
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

                const borderColor = !amDone
                  ? "var(--color-th-t4)"
                  : entered <= 0
                    ? "var(--color-th-r)"
                    : isPR
                      ? "var(--color-th-go)"
                      : entered > minReps
                        ? "var(--color-th-pr)"
                        : entered === minReps
                          ? "var(--color-th-g)"
                          : entered < minReps
                            ? "var(--color-th-r)"
                            : "var(--color-th-g)";

                return (
                  <div key={k}>
                    <div
                      className={cn(
                        "rounded-[14px] p-4 transition-all duration-[250ms]",
                        isPR ? "bg-th-god animate-gold-glow" : "bg-th-s1",
                      )}
                      style={{ border: `2px solid ${borderColor}` }}
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
                            min={minReps}
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
                              min={minReps}
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
                  done={!!done}
                  weight={calcWeight(tm, set.percentage)}
                  unit={prog.unit}
                  reps={set.reps}
                  pct={set.percentage}
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
                  {prog.template === "bbb" || prog.template === "bbbC"
                    ? "BBB"
                    : prog.template === "fsl"
                      ? "FSL"
                      : "SSL"}
                </span>
              }
            />
            {!collapsed.supp && (
              <div className="flex flex-col gap-1 mb-6">
                {supp.map((s) => (
                  <SetRow
                    key={s.key}
                    done={!!checked[s.key]}
                    weight={calcWeight(tm, s.percentage)}
                    unit={prog.unit}
                    reps={s.reps}
                    pct={s.percentage}
                    onClick={() => onSetCheck(s.key, allSets)}
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
              const discovered = isAssistanceDiscovered(a, prog);
              const log = accLog[a.id] || {};

              if (discovered) {
                const rx = getAssistancePrescription(a, activeWeek, prog, liftId);
                const done = (accSets[a.id] || 0) >= rx.sets;
                const setsDone = accSets[a.id] || 0;
                const rxText =
                  rx.type === "bw"
                    ? `${rx.sets}\u00D7${rx.reps}`
                    : `${rx.sets}\u00D7${rx.reps}${rx.weight && rx.weight > 0 ? " @ " + rx.weight + " " + prog.unit : ""}`;

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
                          liftId,
                          slot: a.slot!,
                          currentId: a.id,
                        })
                      }
                      className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-2.5 min-h-[44px]"
                    >
                      <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                        <span className="text-[15px] font-semibold text-th-t">{a.name}</span>
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
                                      a.isBodyweight ? "acc_bw" : "acc_wt",
                                      (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0])
                                        .percentage,
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
              const weekRx = ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0];
              const hasWeight = parseFloat(log.w || "0") > 0;
              const ftSetsDone = accSets[a.id] || 0;
              const ftAllSets = ftSetsDone >= weekRx.sets;
              const ftComplete = ftAllSets && (a.isBodyweight || hasWeight);

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
                        liftId,
                        slot: a.slot!,
                        currentId: a.id,
                      })
                    }
                    className="flex items-center justify-between w-full box-border bg-none border-none p-0 cursor-pointer mb-1 min-h-[44px]"
                  >
                    <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                      <span className="text-[15px] font-semibold text-th-t">{a.name}</span>
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
                      {weekRx.sets}
                      {"\u00D7"}
                      {weekRx.reps}
                    </span>
                  </button>
                  <div className="text-[12px] text-th-t3 mb-2.5">
                    {a.isBodyweight
                      ? "Max reps with good form each set."
                      : "Same weight all " +
                        weekRx.sets +
                        " sets. Leave 1\u20132 reps in the tank."}
                  </div>
                  {!a.isBodyweight && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[13px] font-semibold text-th-t">Weight:</span>
                      <WeightInput
                        inputId={`acc-weight-${a.id}`}
                        value={log.w || ""}
                        onChange={(val) => {
                          setAccLog((p) => ({
                            ...p,
                            [a.id]: { w: val },
                          }));
                          const hasValue = parseFloat(val) > 0;
                          if (hasValue && ftAllSets)
                            setChecked((p) => ({
                              ...p,
                              [`a_${a.id}`]: true,
                            }));
                          else
                            setChecked((p) => {
                              const next = { ...p };
                              delete next[`a_${a.id}`];
                              return next;
                            });
                        }}
                        unit={prog.unit}
                        align="center"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: weekRx.sets }, (_, si) => {
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
                                    weekRx.sets,
                                    a.isBodyweight ? "acc_bw" : "acc_wt",
                                    weekRx.percentage,
                                    isDeload,
                                  );
                                  if (
                                    ftSetsDone + 1 >= weekRx.sets &&
                                    (a.isBodyweight || hasWeight)
                                  ) {
                                    setChecked((p) => ({
                                      ...p,
                                      [`a_${a.id}`]: true,
                                    }));
                                  }
                                }
                              : isLast
                                ? () => untapAccSet(a.id, weekRx.sets)
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
                      {ftSetsDone}/{weekRx.sets}
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
          const disc = isAssistanceDiscovered(a, prog);
          const rx = disc
            ? getAssistancePrescription(a, activeWeek, prog, liftId)
            : { sets: (ASSISTANCE_WEEKS[activeWeek] || ASSISTANCE_WEEKS[0]).sets };
          accSetsTotal += rx.sets;
          accSetsDone += accSets[a.id] || 0;
        });
        const warmupDone = warmup.filter((_, i) => checked[`w${i}`]).length;
        const mainDone = weekDef.sets.filter((_, i) => checked[`m${i}`]).length;
        const suppDone = supp.filter((s) => checked[s.key]).length;
        const done = warmupDone + mainDone + suppDone + accSetsDone;
        const total = warmup.length + weekDef.sets.length + supp.length + accSetsTotal;

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
