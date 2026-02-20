import { useEffect } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProgramStore } from "../stores/program-store";
import { initTheme } from "../stores/ui-store";

const queryClient = new QueryClient();

const RootLayout = () => {
  const loading = useProgramStore.loading();
  const { loadProgram } = useProgramStore.actions();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  if (loading) {
    return (
      <div className="min-h-screen bg-th-bg text-th-t font-sans text-sm leading-normal transition-colors duration-200 flex items-center justify-center h-screen">
        <div className="text-4xl font-extrabold font-mono text-th-a tracking-wide">unrack</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-th-bg text-th-t font-sans text-sm leading-normal transition-colors duration-200">
      <Outlet />
    </div>
  );
};

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <RootLayout />
    </QueryClientProvider>
  ),
});
