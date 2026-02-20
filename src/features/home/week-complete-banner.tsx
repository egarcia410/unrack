import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { TEMPLATES, LIFT_ORDER } from "../../constants/program";
import { PrimaryButton } from "../../components/primary-button";

export const WeekCompleteBanner = () => {
  const workouts = useAppStore.workouts();
  const cycle = useAppStore.cycle();
  const week = useAppStore.week();
  const template = useAppStore.template();
  const { weekAdvanced } = useAppStore.actions();
  const { setCeleb } = useUIStore.actions();

  const variant = TEMPLATES[template];
  const weekDef = variant.weeks[week];
  const weekDone = workouts.filter((w) => w.cycle === cycle && w.week === week);

  if (weekDone.length < LIFT_ORDER.length) return null;

  const weekPRs = weekDone.filter((w) => w.newOneRepMax).length;
  const isLastWeek = week >= variant.weeks.length - 1;
  const isDeload = !weekDef.sets.some((s) => String(s.reps).includes("+"));
  const nextLabel = isLastWeek
    ? "Start Cycle " + (cycle + 1)
    : "Start " + variant.weeks[week + 1].label + " Phase";

  const handleAdvanceWeek = () => {
    const result = weekAdvanced();
    if (result.type === "cycle") {
      setCeleb({
        type: "cycle",
        message: result.message!,
        subtitle: result.subtitle!,
      });
    }
  };

  return (
    <section className="bg-th-ad border border-th-am rounded-2xl px-4 py-5 mb-6 text-center">
      <h2 className="text-lg font-extrabold text-th-a mb-1">{weekDef.label} Complete</h2>
      <p className="text-sm text-th-t2 mb-3">
        {isDeload
          ? "Recovery done. Next cycle starts fresh."
          : weekPRs > 0
            ? weekPRs + " PR" + (weekPRs > 1 ? "s" : "")
            : "All lifts logged"}
        {!isDeload && isLastWeek ? " \u2022 Cycle complete!" : ""}
      </p>
      <PrimaryButton onClick={handleAdvanceWeek}>{nextLabel}</PrimaryButton>
    </section>
  );
};
