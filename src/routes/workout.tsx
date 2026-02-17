import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { useWorkoutStore } from "../stores/workout-store";
import { useUIStore, useTheme } from "../stores/ui-store";
import { FN } from "../constants/theme";
import { VARS, LIFTS, LIFT_ORDER } from "../constants/program";
import { EXERCISE_LIB, CATS, CAT_LABELS, CAT_COLORS, AW } from "../constants/exercises";
import { calcWeight, epley, smartRest } from "../lib/calc";
import { getAccForLift, accDiscovered, getRx } from "../lib/exercises";
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
  const { mode, c } = useTheme();
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
      <div style={appStyle}>
        {/* Swap exercise sheet */}
        {swapSlot && (
          <BottomSheet
            title="Swap Exercise"
            c={c}
            onClose={() => setSwapSlot(null)}
            maxHeight="70vh"
          >
            {CATS.map((cat) => {
              const catColor = CAT_COLORS(c)[cat as keyof ReturnType<typeof CAT_COLORS>];
              const exercises = EXERCISE_LIB.filter((e) => e.cat === cat);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".7px",
                      color: catColor,
                      padding: "8px 4px 4px",
                    }}
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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          background: isCurrent ? c.ad : "transparent",
                          border: isCurrent ? `1px solid ${c.am}` : `1px solid transparent`,
                          borderRadius: 10,
                          cursor: isCurrent ? "default" : "pointer",
                          textAlign: "left",
                          minHeight: 48,
                          marginBottom: 2,
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            background: isCurrent ? c.a : isNew ? c.t4 : c.g,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            fontSize: 14,
                            fontWeight: isCurrent ? 700 : 500,
                            color: c.t,
                          }}
                        >
                          {e.nm}
                        </span>
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
                        {!isCurrent && hasMax && (
                          <span
                            style={{
                              fontSize: 12,
                              fontFamily: FN.m,
                              fontWeight: 700,
                              color: c.pr,
                              background: c.prd,
                              padding: "2px 10px",
                              borderRadius: 100,
                            }}
                          >
                            {rx.wt} {prog.unit}
                          </span>
                        )}
                        {!isCurrent && isNew && (
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: FN.m,
                              color: c.y,
                              background: c.yd,
                              padding: "2px 8px",
                              borderRadius: 100,
                            }}
                          >
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

        <div style={topBarStyle}>
          <button onClick={() => navigate({ to: "/" })} style={iconBtnStyle}>
            <ChevronLeft size={18} />
          </button>
          <span style={pillStyle}>
            C{prog.cycle} {wd.t}
          </span>
        </div>

        {showTimer && (
          <RestTimer
            c={c}
            dur={timerInfo.dur}
            timerKey={timerKey}
            onDismiss={dismissTimer}
            why={timerInfo.why}
          />
        )}

        <div style={{ textAlign: "center", padding: "4px 0 20px" }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "2px 0",
              letterSpacing: "-1px",
            }}
          >
            {lift.nm}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontFamily: FN.m,
                color: c.a,
                fontWeight: 600,
              }}
            >
              TM {tm}
            </span>
            <span
              style={{
                fontSize: 14,
                fontFamily: FN.m,
                color: c.t3,
              }}
            >
              1RM {prog.e1[lid]}
            </span>
          </div>
        </div>

        {/* Warm-up */}
        <SectionHeader
          label="Warm-up"
          done={allWarmup}
          collapsed={!!collapsed.warmup}
          onToggle={() => toggleCollapse("warmup")}
          c={c}
        />
        {!collapsed.warmup && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 24,
            }}
          >
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
                  c={c}
                  mode={mode}
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
          c={c}
        />
        {!collapsed.main && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 24,
            }}
          >
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
                const clr = !amDone
                  ? c.t4
                  : entered <= 0
                    ? c.r
                    : isPR
                      ? c.go
                      : entered > minR
                        ? c.pr
                        : entered === minR
                          ? c.g
                          : entered < minR
                            ? c.r
                            : c.g;
                void clr;
                const bgColor = isPR ? c.god : c.s1;

                return (
                  <div key={k}>
                    <div
                      style={{
                        background: bgColor,
                        border:
                          "2px solid " +
                          (!amDone
                            ? c.t4
                            : entered <= 0
                              ? c.r
                              : isPR
                                ? c.go
                                : entered > minR
                                  ? c.pr
                                  : entered === minR
                                    ? c.g
                                    : entered < minR
                                      ? c.r
                                      : c.g),
                        borderRadius: 14,
                        padding: "16px",
                        transition: "all .25s",
                        ...(isPR
                          ? {
                              animation: "gold-glow 1.5s ease-in-out infinite",
                            }
                          : {}),
                      }}
                    >
                      {!amDone ? (
                        <button
                          onClick={activateAmrap}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            boxSizing: "border-box",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            minHeight: 56,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 22,
                                fontWeight: 800,
                                fontFamily: FN.m,
                                color: c.t,
                              }}
                            >
                              {amrapWeight}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: c.t4,
                                fontFamily: FN.m,
                                fontWeight: 600,
                              }}
                            >
                              {" "}
                              {prog.unit}
                            </span>
                            {goalReps && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: c.t4,
                                  fontFamily: FN.m,
                                  marginTop: 4,
                                }}
                              >
                                PR at{" "}
                                <span
                                  style={{
                                    color: c.go,
                                    fontWeight: 700,
                                  }}
                                >
                                  {goalReps}+
                                </span>
                              </div>
                            )}
                          </div>
                          <PRRing
                            size={58}
                            min={minR}
                            prGoal={goalReps}
                            value={0}
                            c={c}
                            active={true}
                            activated={false}
                          />
                        </button>
                      ) : (
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              color: c.t4,
                              fontFamily: FN.m,
                              marginBottom: 8,
                              textAlign: "center",
                            }}
                          >
                            {amrapWeight} {prog.unit}
                            {goalReps ? ` \u00B7 PR at ${goalReps}+` : ""}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 12,
                            }}
                          >
                            <button
                              onClick={stepDown}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                border: "1px solid " + c.b,
                                background: c.s2,
                                color: c.t3,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                                fontWeight: 700,
                                fontFamily: FN.m,
                              }}
                            >
                              {"\u2212"}
                            </button>
                            <PRRing
                              size={80}
                              min={minR}
                              prGoal={goalReps}
                              value={entered}
                              c={c}
                              active={true}
                              activated={true}
                            />
                            <button
                              onClick={stepUp}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                border: "1px solid " + c.b,
                                background: c.s2,
                                color: c.t3,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                                fontWeight: 700,
                                fontFamily: FN.m,
                              }}
                            >
                              +
                            </button>
                          </div>
                          {isPR && curE1 > 0 && (
                            <div
                              style={{
                                fontSize: 14,
                                fontFamily: FN.m,
                                fontWeight: 800,
                                marginTop: 10,
                                color: c.go,
                                textAlign: "center",
                              }}
                            >
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
                  c={c}
                  mode={mode}
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
              c={c}
              extra={
                <span style={{ color: c.t4 }}>
                  {prog.variant === "bbb" || prog.variant === "bbbC"
                    ? "BBB"
                    : prog.variant === "fsl"
                      ? "FSL"
                      : "SSL"}
                </span>
              }
            />
            {!collapsed.supp && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: 24,
                }}
              >
                {supp.map((s) => (
                  <SetRow
                    key={s.k}
                    done={!!checked[s.k]}
                    weight={calcWeight(tm, s.p)}
                    unit={prog.unit}
                    reps={s.r}
                    pct={s.p}
                    onClick={() => onSetCheck(s.k, allSets)}
                    c={c}
                    mode={mode}
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
          c={c}
        />
        {!collapsed.acc && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 24,
            }}
          >
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
                    style={{
                      background: done ? c.gd : c.s1,
                      border: `1px solid ${done ? c.gb : c.b}`,
                      borderRadius: 12,
                      padding: "12px 14px",
                      transition: "all .15s",
                    }}
                  >
                    <button
                      onClick={() =>
                        setSwapSlot({
                          liftId: lid,
                          slot: a.slot!,
                          currentId: a.id,
                        })
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        boxSizing: "border-box",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        marginBottom: 10,
                        minHeight: 44,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: c.t,
                          }}
                        >
                          {a.nm}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={c.t4}
                          strokeWidth="2.5"
                          style={{ flexShrink: 0 }}
                        >
                          <path d="M8 9l4 4 4-4" />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontFamily: FN.m,
                          fontWeight: 600,
                          color: c.t3,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {rxText}
                      </span>
                    </button>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
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
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              border: `2px solid ${filled ? c.g : isNext ? c.t3 : c.t4}`,
                              background: filled ? c.g : c.s2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: filled ? (mode === "dark" ? "#111" : "#fff") : c.t4,
                              cursor: isNext || isLast ? "pointer" : "default",
                              transition: "all .15s",
                              opacity: isNext || filled ? 1 : 0.35,
                            }}
                          >
                            {filled && <Check size={13} strokeWidth={3} />}
                            {!filled && isNext && (
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  fontFamily: FN.m,
                                  color: c.t3,
                                }}
                              >
                                {si + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: FN.m,
                          color: c.t3,
                          marginLeft: 4,
                        }}
                      >
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
                  style={{
                    background: ftComplete ? c.gd : c.s1,
                    border: `1px solid ${ftComplete ? c.gb : c.yb}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    transition: "all .15s",
                  }}
                >
                  <button
                    onClick={() =>
                      setSwapSlot({
                        liftId: lid,
                        slot: a.slot!,
                        currentId: a.id,
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      boxSizing: "border-box",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      marginBottom: 4,
                      minHeight: 44,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: c.t,
                        }}
                      >
                        {a.nm}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={c.t4}
                        strokeWidth="2.5"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M8 9l4 4 4-4" />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: FN.m,
                        fontWeight: 600,
                        color: c.y,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {weekRx.s}
                      {"\u00D7"}
                      {weekRx.r}
                    </span>
                  </button>
                  <div
                    style={{
                      fontSize: 12,
                      color: c.t3,
                      marginBottom: 10,
                    }}
                  >
                    {a.bw
                      ? "Max reps with good form each set."
                      : "Same weight all " + weekRx.s + " sets. Leave 1\u20132 reps in the tank."}
                  </div>
                  {!a.bw && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: c.t,
                        }}
                      >
                        Weight:
                      </span>
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
                        style={{
                          ...inputStyle,
                          width: 90,
                          padding: "10px 8px",
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: c.t4,
                          fontFamily: FN.m,
                        }}
                      >
                        {prog.unit}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
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
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            border: `2px solid ${filled ? c.g : isNext ? c.t3 : c.t4}`,
                            background: filled ? c.g : c.s2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: filled ? (mode === "dark" ? "#111" : "#fff") : c.t4,
                            cursor: isNext || isLast ? "pointer" : "default",
                            transition: "all .15s",
                            opacity: isNext || filled ? 1 : 0.35,
                          }}
                        >
                          {filled && <Check size={13} strokeWidth={3} />}
                          {!filled && isNext && (
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: FN.m,
                                color: c.t3,
                              }}
                            >
                              {si + 1}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: FN.m,
                        color: c.t3,
                        marginLeft: 4,
                      }}
                    >
                      {ftSetsDone}/{weekRx.s}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 70 }} />
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
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              transition: "all .3s",
            }}
          >
            <div
              style={{
                maxWidth: 460,
                margin: "0 auto",
                padding: canFinish ? "0" : "16px 20px",
                background: canFinish ? c.g : c.s1,
                borderTop: `1px solid ${canFinish ? c.gb : c.b}`,
                boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {canFinish ? (
                <button
                  onClick={handleFinish}
                  style={{
                    width: "100%",
                    padding: "18px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: FN.s,
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: mode === "dark" ? "#111" : "#fff",
                    }}
                  >
                    Complete Workout
                  </span>
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontFamily: FN.m,
                        fontWeight: 700,
                        color: c.t,
                        flexShrink: 0,
                      }}
                    >
                      {done}/{total}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        background: c.s3,
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(done / total) * 100}%`,
                          background: c.a,
                          borderRadius: 3,
                          transition: "width .3s",
                        }}
                      />
                    </div>
                  </div>
                  {workoutStart && <LiveClock start={workoutStart} c={c} />}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
