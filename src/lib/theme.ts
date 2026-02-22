import type { ThemeMode } from "../types";

const THEME_KEY = "unrack-theme";

/** Read the persisted theme mode, defaulting to dark and persisting on first access. */
export const getThemeMode = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  localStorage.setItem(THEME_KEY, "dark");
  return "dark";
};

export const initTheme = () => {
  const mode = getThemeMode();
  document.documentElement.classList.toggle("dark", mode === "dark");
};

export const toggleTheme = (): ThemeMode => {
  const next: ThemeMode = getThemeMode() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  document.documentElement.classList.toggle("dark", next === "dark");
  return next;
};
