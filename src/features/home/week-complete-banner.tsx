import { Dot } from "lucide-react";
import {
  usePhase,
  useCycle,
  useTemplate,
  useCurrentPhase,
  useCurrentPhaseWorkouts,
  phaseAdvanced,
} from "../../stores/polaris";
import { LIFT_ORDER } from "../../constants/program";
import { PrimaryButton } from "../../components/primary-button";

export const WeekCompleteBanner = () => {
  const phase = usePhase();
  const cycle = useCycle();
  const template = useTemplate();
  const currentPhase = useCurrentPhase();
  const currentPhaseWorkouts = useCurrentPhaseWorkouts();
  if (currentPhaseWorkouts.length < LIFT_ORDER.length) return null;

  const weekPRs = currentPhaseWorkouts.filter((workout) => workout.newOneRepMax).length;
  const isLastPhase = phase >= template.phases.length - 1;
  const isDeload = !currentPhase.sets.some((s) => String(s.reps).includes("+"));
  const nextLabel = isLastPhase
    ? "Start Cycle " + (cycle + 1)
    : "Start " + template.phases[phase + 1].label + " Phase";

  const handleAdvancePhase = () => {
    phaseAdvanced();
  };

  return (
    <section className="bg-th-ad border border-th-am rounded-2xl px-4 py-5 mb-6 text-center">
      <h2 className="text-lg font-extrabold text-th-a mb-1">{currentPhase.label} Complete</h2>
      <p className="text-sm text-th-t2 mb-3 flex items-center justify-center">
        {isDeload
          ? "Recovery done. Next cycle starts fresh."
          : weekPRs > 0
            ? weekPRs + " PR" + (weekPRs > 1 ? "s" : "")
            : "All lifts logged"}
        {!isDeload && isLastPhase && (
          <>
            <Dot size={16} />
            Cycle complete!
          </>
        )}
      </p>
      <PrimaryButton onClick={handleAdvancePhase}>{nextLabel}</PrimaryButton>
    </section>
  );
};
