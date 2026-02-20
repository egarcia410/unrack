import type { ProgramData } from "../types";

const STORE_KEY = "unrack-v1";

export const loadData = (): ProgramData | null => {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ProgramData;
  } catch {
    return null;
  }
};

export const saveData = (data: ProgramData): void => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
};

export const clearData = (): void => {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch (error) {
    console.error(error);
  }
};
