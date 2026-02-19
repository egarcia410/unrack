import { LIFT_ORDER } from "../../constants/program";
import { LiftCard } from "./lift-card";

export const LiftCardList = () => (
  <div className="flex flex-col gap-1.5 mb-6">
    {LIFT_ORDER.map((liftId, index) => (
      <LiftCard key={liftId} liftIndex={index} />
    ))}
  </div>
);
