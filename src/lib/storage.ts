import type { ProgramData } from "../types";
import { ID_MIGRATE } from "../constants/migrations";

export const STORE_KEY = "unrack-v1";

export function migrateAccIds(data: ProgramData): ProgramData {
  if (!data) return data;
  let changed = false;
  const migrate = (obj: Record<string, unknown>) => {
    if (!obj) return obj;
    const n = { ...obj };
    Object.entries(ID_MIGRATE).forEach(([old, nw]) => {
      if (n[old] !== undefined) {
        if (n[nw] === undefined || n[nw] === 0) n[nw] = n[old];
        else if (typeof n[old] === "number" && typeof n[nw] === "number")
          n[nw] = Math.max(n[nw] as number, n[old] as number);
        delete n[old];
        changed = true;
      }
    });
    return n;
  };
  data.accMax = migrate(data.accMax || {}) as Record<string, number>;
  data.bwBase = migrate(data.bwBase || {}) as Record<string, number>;
  if (data.aH) {
    const nH = { ...data.aH };
    Object.entries(ID_MIGRATE).forEach(([old, nw]) => {
      if (nH[old]) {
        if (!nH[nw]) nH[nw] = [];
        nH[nw] = [...nH[nw], ...nH[old]].sort((a, b) => (a.dt || 0) - (b.dt || 0));
        delete nH[old];
        changed = true;
      }
    });
    data.aH = nH;
  }
  void changed;
  return data;
}

export async function loadData(): Promise<ProgramData | null> {
  try {
    let r = await window.storage.get(STORE_KEY);
    if (!r) r = await window.storage.get("531-v9");
    if (!r) r = await window.storage.get("531-v8");
    if (!r) r = await window.storage.get("531-v7");
    if (!r) r = await window.storage.get("531-v6");
    if (!r) return null;
    const d = JSON.parse(r.value);
    return migrateAccIds(d);
  } catch {
    return null;
  }
}

export async function saveData(d: ProgramData): Promise<void> {
  try {
    await window.storage.set(STORE_KEY, JSON.stringify(d));
  } catch (e) {
    console.error(e);
  }
}

export async function clearData(): Promise<void> {
  try {
    await window.storage.delete(STORE_KEY);
  } catch (e) {
    console.error(e);
  }
}
