import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useProgramStore } from "../stores/program-store";
import { LIFTS } from "../constants/program";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/history")({
  beforeLoad: () => {
    const { prog, loading } = useProgramStore.getState();
    if (!loading && !prog) throw redirect({ to: "/setup" });
  },
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const prog = useProgramStore((s) => s.prog);

  if (!prog) return null;

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
    <div className="max-w-[460px] mx-auto px-4 py-3 pb-20">
      <div className="flex justify-between items-center py-2 pb-4 min-h-[44px]">
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-[44px] h-[44px] flex items-center justify-center bg-th-s1 border border-th-b rounded-[10px] text-th-t3 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div />
      </div>
      <h1 className="text-2xl font-extrabold m-0 mb-4">History</h1>
      <div className="text-[11px] font-bold uppercase tracking-[1px] text-th-t2 mb-2.5">
        1RM Progress
      </div>
      <div className="flex flex-col gap-1.5 mb-6">
        {liftData.map((ld) => (
          <div key={ld.lift.id} className="bg-th-s1 border border-th-b rounded-xl px-4 py-3.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[16px] font-bold text-th-t">{ld.lift.nm}</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold font-mono text-th-t">{ld.e1}</span>
                  <span className="text-[12px] text-th-t4 font-mono">{prog.unit}</span>
                  {ld.gain > 0 && (
                    <span className="text-[12px] font-mono font-bold text-th-g">+{ld.gain}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {ld.best > ld.e1 && (
                  <div className="text-[11px] font-mono text-th-t3">
                    Best: <span className="font-bold text-th-go">{ld.best}</span>
                  </div>
                )}
                {ld.prCount > 0 && (
                  <div className="text-[11px] font-mono text-th-t4">
                    {ld.prCount} PR{ld.prCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
            {ld.lastPR && (
              <div className="mt-2 pt-2 border-t border-th-b flex justify-between items-center">
                <span className="text-[11px] text-th-t3 font-mono">
                  Last PR: {ld.lastPR.old} {"\u2192"} {ld.lastPR.nw}
                </span>
                <span className="text-[11px] font-mono font-bold text-th-go">
                  {ld.lastPR.w}x{ld.lastPR.reps}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-[1px] text-th-t2 mb-2.5">
            Recent Workouts
          </div>
          <div className="flex flex-col gap-1 mb-6">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-th-s1 border border-th-b rounded-[10px] px-4 py-2.5 min-h-[48px]"
              >
                <span className="text-[12px] font-mono text-th-t4 min-w-[36px]">{r.dayStr}</span>
                <span className="text-[14px] font-semibold text-th-t flex-1">
                  {r.lift?.nm || "?"}
                </span>
                {r.dur > 0 && (
                  <span className="text-[11px] font-mono text-th-t4">
                    {Math.floor(r.dur / 60)}m
                  </span>
                )}
                {r.amReps !== null && (
                  <span
                    className={cn(
                      "text-[13px] font-mono font-bold",
                      r.hadPR ? "text-th-go" : r.amReps === 0 ? "text-th-r" : "text-th-t3",
                    )}
                  >
                    {r.amReps} reps
                  </span>
                )}
                {r.hadPR && (
                  <span className="text-[10px] font-mono font-bold text-th-go bg-th-god px-2 py-0.5 rounded-full">
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
