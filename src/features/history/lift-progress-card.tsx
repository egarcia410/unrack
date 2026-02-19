import { ArrowRight } from "lucide-react";
import type { LiftProgressEntry } from "./use-history-data";

type LiftProgressCardProps = {
  entry: LiftProgressEntry;
  unit: string;
};

export const LiftProgressCard = ({ entry, unit }: LiftProgressCardProps) => {
  return (
    <div className="bg-th-s1 border border-th-b rounded-xl px-4 py-3.5">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-base font-bold text-th-t">{entry.lift.name}</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold font-mono text-th-t">{entry.oneRepMax}</span>
            <span className="text-xs text-th-t4 font-mono">{unit}</span>
            {entry.gain > 0 && (
              <span className="text-xs font-mono font-bold text-th-g">+{entry.gain}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          {entry.best > entry.oneRepMax && (
            <div className="text-xs font-mono text-th-t3">
              Best: <span className="font-bold text-th-go">{entry.best}</span>
            </div>
          )}
          {entry.personalRecordCount > 0 && (
            <div className="text-xs font-mono text-th-t4">
              {entry.personalRecordCount} PR{entry.personalRecordCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
      {entry.lastPersonalRecord && (
        <div className="mt-2 pt-2 border-t border-th-b flex justify-between items-center">
          <span className="text-xs text-th-t3 font-mono">
            Last PR: {entry.lastPersonalRecord.old} <ArrowRight size={10} className="inline" />{" "}
            {entry.lastPersonalRecord.newValue}
          </span>
          <span className="text-xs font-mono font-bold text-th-go">
            {entry.lastPersonalRecord.weight}x{entry.lastPersonalRecord.reps}
          </span>
        </div>
      )}
    </div>
  );
};
