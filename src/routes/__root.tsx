import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "../stores/app-store";
import { initTheme } from "../stores/ui-store";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  beforeLoad: () => {
    const state = useAppStore.getState();
    if (state.loading) {
      state.actions.loadProgram();
    }
    initTheme();
  },
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-th-bg text-th-t font-sans text-sm leading-normal transition-colors duration-200">
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
});
