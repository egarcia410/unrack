import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasProgramData } from "../stores/app-store";
import { Celebration } from "../components/celebration";
import { DeleteConfirmDialog } from "../components/delete-confirm-dialog";
import { HomeHeader } from "../features/home/home-header";
import { SettingsDrawer } from "../features/home/settings-drawer";
import { TemplatePickerDrawer } from "../features/home/template-picker-drawer";
import { WeekOverview } from "../features/home/week-overview";
import { WeekProgressBar } from "../features/home/week-progress-bar";
import { LiftCardList } from "../features/home/lift-card-list";
import { WeekCompleteBanner } from "../features/home/week-complete-banner";

const HomePage = () => (
  <main className="mx-auto max-w-115 px-4 py-3 pb-20">
    <Celebration />
    <DeleteConfirmDialog />
    <HomeHeader />
    <SettingsDrawer />
    <TemplatePickerDrawer />
    <WeekOverview />
    <WeekProgressBar />
    <LiftCardList />
    <WeekCompleteBanner />
  </main>
);

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!hasProgramData()) throw redirect({ to: "/setup" });
  },
  component: HomePage,
});
