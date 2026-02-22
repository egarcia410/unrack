import type { ThemeMode } from "../types";
import { createStore } from "./polaris";

const THEME_KEY = "unrack-theme";

const loadMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    // Migration: check legacy program data
    const program = localStorage.getItem("unrack-v1");
    if (program) {
      const parsed = JSON.parse(program);
      if (parsed.mode === "light" || parsed.mode === "dark") return parsed.mode;
    }
  } catch {}
  return "dark";
};

type UIState = {
  mode: ThemeMode;
};

const initialState: UIState = {
  mode: loadMode(),
};

export const useUIStore = createStore("ui", {
  state: initialState,
  actions: (set, get) => ({
    setMode: (mode: ThemeMode) => {
      document.documentElement.classList.toggle("dark", mode === "dark");
      localStorage.setItem(THEME_KEY, mode);
      set({ mode });
    },
    toggleMode: () => {
      const next = get().mode === "dark" ? ("light" as const) : ("dark" as const);
      useUIStore.actions.setMode(next);
    },
  }),
});

export const initTheme = () => {
  const mode = useUIStore.getState().mode;
  document.documentElement.classList.toggle("dark", mode === "dark");
};
