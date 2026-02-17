import { useEffect } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProgramStore } from "../stores/program-store";
import { useTheme } from "../stores/ui-store";
import { FN, prPulseCSS } from "../constants/theme";

const queryClient = new QueryClient();

function RootLayout() {
  const loading = useProgramStore((s) => s.loading);
  const loadProgram = useProgramStore((s) => s.loadProgram);
  const { c } = useTheme();

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  const wrapStyle = {
    minHeight: "100vh",
    background: c.bg,
    color: c.t,
    fontFamily: FN.s,
    fontSize: 14,
    lineHeight: 1.5,
    WebkitFontSmoothing: "antialiased" as const,
    transition: "background .25s, color .25s",
  };

  if (loading) {
    return (
      <>
        <style>{prPulseCSS}</style>
        <div
          style={{
            ...wrapStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              fontFamily: FN.m,
              color: c.a,
              letterSpacing: "0.5px",
            }}
          >
            unrack
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={wrapStyle}>
      <style>{prPulseCSS}</style>
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <RootLayout />
    </QueryClientProvider>
  ),
});
