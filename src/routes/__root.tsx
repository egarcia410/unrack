import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppOverlays } from "../components/app-overlays";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-th-bg text-th-t font-sans text-sm leading-normal transition-colors duration-200">
        <Outlet />
        <AppOverlays />
      </div>
    </QueryClientProvider>
  ),
});
