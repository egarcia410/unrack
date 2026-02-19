import { createFileRoute, redirect } from "@tanstack/react-router";
import { useProgramStore } from "../stores/program-store";
import { useHistoryData } from "../features/history/use-history-data";
import { LiftProgressCard } from "../features/history/lift-progress-card";
import { RecentWorkoutRow } from "../features/history/recent-workout-row";
import { BackButton } from "../components/back-button";

const HistoryPage = () => {
  const historyData = useHistoryData();

  if (!historyData) return null;

  const { programData, liftProgressEntries, recentWorkouts } = historyData;

  return (
    <div className="max-w-115 mx-auto px-4 py-3 pb-20">
      <div className="flex justify-between items-center py-2 pb-4 min-h-11">
        <BackButton />
        <div />
      </div>
      <h1 className="text-2xl font-extrabold m-0 mb-4">History</h1>
      <div className="text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5">
        1RM Progress
      </div>
      <div className="flex flex-col gap-1.5 mb-6">
        {liftProgressEntries.map((entry) => (
          <LiftProgressCard key={entry.lift.id} entry={entry} unit={programData.unit} />
        ))}
      </div>
      {recentWorkouts.length > 0 && (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-th-t2 mb-2.5">
            Recent Workouts
          </div>
          <div className="flex flex-col gap-1 mb-6">
            {recentWorkouts.map((entry, index) => (
              <RecentWorkoutRow key={index} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const Route = createFileRoute("/history")({
  beforeLoad: () => {
    const { prog, loading } = useProgramStore.getState();
    if (!loading && !prog) throw redirect({ to: "/setup" });
  },
  component: HistoryPage,
});
