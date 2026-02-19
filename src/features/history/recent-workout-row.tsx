import { cn } from "../../lib/cn";
import type { RecentWorkoutEntry } from "./use-history-data";

type RecentWorkoutRowProps = {
  entry: RecentWorkoutEntry;
};

export const RecentWorkoutRow = ({ entry }: RecentWorkoutRowProps) => {
  return (
    <div className="flex items-center gap-3 bg-th-s1 border border-th-b rounded-xl px-4 py-2.5 min-h-12">
      <span className="text-xs font-mono text-th-t4 min-w-9">{entry.dateLabel}</span>
      <span className="text-sm font-semibold text-th-t flex-1">{entry.lift?.name || "?"}</span>
      {entry.duration > 0 && (
        <span className="text-xs font-mono text-th-t4">{Math.floor(entry.duration / 60)}m</span>
      )}
      {entry.amrapReps !== null && (
        <span
          className={cn(
            "text-sm font-mono font-bold",
            entry.hadPersonalRecord
              ? "text-th-go"
              : entry.amrapReps === 0
                ? "text-th-r"
                : "text-th-t3",
          )}
        >
          {entry.amrapReps} reps
        </span>
      )}
      {entry.hadPersonalRecord && (
        <span className="text-xs font-mono font-bold text-th-go bg-th-god px-2 py-0.5 rounded-full">
          PR
        </span>
      )}
    </div>
  );
};
