import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasActiveWorkout } from "../stores/workout-store";
import { SwapExerciseDrawer } from "../features/workout/swap-exercise-drawer";
import { WorkoutHeader } from "../features/workout/workout-header";
import { RestTimer } from "../components/rest-timer";
import { WarmupSection } from "../features/workout/warmup-section";
import { WorkingSetsSection } from "../features/workout/working-sets-section";
import { SupplementalSection } from "../features/workout/supplemental-section";
import { AssistanceSection } from "../features/workout/assistance-section";
import { WorkoutBottomBar } from "../features/workout/workout-bottom-bar";

const WorkoutPage = () => (
  <div>
    <main className="mx-auto max-w-115 px-4 py-3 pb-20">
      <SwapExerciseDrawer />
      <WorkoutHeader />
      <RestTimer />
      <WarmupSection />
      <WorkingSetsSection />
      <SupplementalSection />
      <AssistanceSection />
      <div className="h-18" />
    </main>
    <WorkoutBottomBar />
  </div>
);

export const Route = createFileRoute("/workout")({
  beforeLoad: () => {
    if (!hasActiveWorkout()) throw redirect({ to: "/" });
  },
  component: WorkoutPage,
});
