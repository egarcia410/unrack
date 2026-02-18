import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LIFTS } from "../constants/program";
import { roundToNearest } from "../lib/calc";
import { cn } from "../lib/cn";
import { useProgramStore } from "../stores/program-store";
import { useTheme } from "../stores/ui-store";

export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    const prog = useProgramStore.getState().prog;
    if (prog) throw redirect({ to: "/" });
  },
  component: SetupPage,
});

function SetupPage() {
  const { mode } = useTheme();
  const createProgram = useProgramStore((s) => s.createProgram);
  const navigate = useNavigate();
  const inferredUnit = (
    (typeof navigator !== "undefined" && navigator.language) ||
    "en-US"
  ).startsWith("en-US")
    ? "lb"
    : "kg";

  const [vari] = useState("fsl");
  const [unit] = useState<"lb" | "kg">(inferredUnit);
  const [orms, setOrms] = useState<Record<string, string>>({
    ohp: "",
    deadlift: "",
    bench: "",
    squat: "",
  });
  const [tmPct] = useState(90);

  const calcTM = (orm: string) => roundToNearest(parseFloat(orm) * (tmPct / 100));
  const allOrmValid = LIFTS.every((l) => parseFloat(orms[l.id]) > 0);

  const handleCreate = async () => {
    await createProgram({ variant: vari, unit, tmPct, orms, mode });
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-[460px] mx-auto px-4 py-3 pb-20">
      <div className="flex flex-col items-center pt-12 pb-8 gap-1.5">
        <div className="text-4xl font-extrabold font-mono text-th-a tracking-[0.5px]">unrack</div>
        <p className="text-th-t3 text-[13px] tracking-[.5px] uppercase m-0">Strength Program</p>
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[1px] text-th-t2 mb-2.5">
        Enter Your 1 Rep Maxes
      </div>
      <div className="flex flex-col gap-1.5 mb-6">
        {LIFTS.map((l) => {
          const val = orms[l.id];
          const tm = parseFloat(val) > 0 ? calcTM(val) : 0;
          return (
            <div
              key={l.id}
              className="flex justify-between items-center bg-th-s1 border border-th-b rounded-xl px-4 py-3 min-h-[56px]"
            >
              <div>
                <div className="text-[14px] font-semibold text-th-t">{l.name}</div>
                {tm > 0 && (
                  <div className="text-[12px] text-th-a font-mono">
                    TM = {tm} {unit}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={val}
                  onChange={(e) => setOrms((p) => ({ ...p, [l.id]: e.target.value }))}
                  className="w-20 px-2 py-2.5 text-[18px] font-bold text-right bg-th-s2 border border-th-bm rounded-lg text-th-t font-mono outline-none box-border"
                />
                <span className="text-[13px] text-th-t4 font-mono">{unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleCreate}
        disabled={!allOrmValid}
        className={cn(
          "w-full border-none rounded-xl px-6 py-4 text-[16px] font-bold font-sans cursor-pointer flex items-center justify-center gap-2 min-h-[52px]",
          allOrmValid
            ? "bg-th-a text-th-inv opacity-100"
            : "bg-th-s3 text-th-t4 opacity-35 cursor-not-allowed",
        )}
      >
        Start Program
      </button>
    </div>
  );
}
