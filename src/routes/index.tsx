import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasProgramData } from "../stores/program-store";
import { HomeHeader } from "../features/home/home-header";
import { WeekOverview } from "../features/home/week-overview";
import { WeekProgressBar } from "../features/home/week-progress-bar";
import { LiftCardList } from "../features/home/lift-card-list";
import { WeekCompleteBanner } from "../features/home/week-complete-banner";

const HomePage = () => (
  <div className="mx-auto max-w-115 px-4 py-3 pb-20">
    <HomeHeader />
    <main>
      <WeekOverview />
      <WeekProgressBar />
      <LiftCardList />
      <WeekCompleteBanner />
    </main>
  </div>
);

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!hasProgramData()) throw redirect({ to: "/setup" });
  },
  component: HomePage,
});
