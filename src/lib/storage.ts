import type { ProgramData } from "../types";
import { ID_MIGRATE } from "../constants/migrations";

export const STORE_KEY = "unrack-v1";

function renameKeys(
  obj: Record<string, unknown>,
  map: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[map[key] || key] = value;
  }
  return result;
}

export function migratePropertyNames(data: Record<string, unknown>): Record<string, unknown> {
  const topMap: Record<string, string> = {
    tmPct: "trainingMaxPercent",
    tms: "trainingMaxes",
    e1: "oneRepMaxes",
    wk: "workouts",
    aH: "assistanceHistory",
    accMax: "assistanceMaximums",
    bwBase: "bodyweightBaselines",
    accSlots: "assistanceSlots",
    customEx: "customExercises",
    ts: "timestamp",
  };

  // Only migrate if old keys are present (not already migrated)
  const hasOldKeys = Object.keys(topMap).some((k) => data[k] !== undefined);
  if (!hasOldKeys) return data;

  const migrated = renameKeys(data, topMap);

  // Migrate WorkoutEntry array
  if (Array.isArray(migrated.workouts)) {
    const entryMap: Record<string, string> = {
      cy: "cycle",
      wk: "week",
      dy: "day",
      lf: "lift",
      dt: "datetime",
      dur: "duration",
      am: "amrapReps",
      al: "assistanceLog",
      ne1: "newOneRepMax",
    };
    const ne1Map: Record<string, string> = {
      nw: "newValue",
      w: "weight",
    };
    migrated.workouts = (migrated.workouts as Record<string, unknown>[]).map((entry) => {
      const newEntry = renameKeys(entry, entryMap);
      if (newEntry.newOneRepMax && typeof newEntry.newOneRepMax === "object") {
        newEntry.newOneRepMax = renameKeys(
          newEntry.newOneRepMax as Record<string, unknown>,
          ne1Map,
        );
      }
      return newEntry;
    });
  }

  // Migrate assistanceHistory entries
  if (migrated.assistanceHistory && typeof migrated.assistanceHistory === "object") {
    const ahEntryMap: Record<string, string> = {
      dt: "datetime",
      cy: "cycle",
      wk: "week",
      w: "weight",
      bw: "isBodyweight",
    };
    const newHistory: Record<string, unknown[]> = {};
    for (const [key, entries] of Object.entries(
      migrated.assistanceHistory as Record<string, unknown[]>,
    )) {
      if (Array.isArray(entries)) {
        newHistory[key] = entries.map((entry) =>
          typeof entry === "object" && entry
            ? renameKeys(entry as Record<string, unknown>, ahEntryMap)
            : entry,
        );
      } else {
        newHistory[key] = entries;
      }
    }
    migrated.assistanceHistory = newHistory;
  }

  // Migrate customExercises entries
  if (migrated.customExercises && typeof migrated.customExercises === "object") {
    const exMap: Record<string, string> = {
      nm: "name",
      cat: "category",
      bw: "isBodyweight",
    };
    const newCustomEx: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(
      migrated.customExercises as Record<string, unknown>,
    )) {
      if (typeof entry === "object" && entry) {
        newCustomEx[key] = renameKeys(entry as Record<string, unknown>, exMap);
      } else {
        newCustomEx[key] = entry;
      }
    }
    migrated.customExercises = newCustomEx;
  }

  return migrated;
}

export function migrateAccIds(data: ProgramData): ProgramData {
  if (!data) return data;
  let changed = false;
  const migrate = (obj: Record<string, unknown>) => {
    if (!obj) return obj;
    const result = { ...obj };
    Object.entries(ID_MIGRATE).forEach(([old, newKey]) => {
      if (result[old] !== undefined) {
        if (result[newKey] === undefined || result[newKey] === 0) result[newKey] = result[old];
        else if (typeof result[old] === "number" && typeof result[newKey] === "number")
          result[newKey] = Math.max(result[newKey] as number, result[old] as number);
        delete result[old];
        changed = true;
      }
    });
    return result;
  };
  data.assistanceMaximums = migrate(data.assistanceMaximums || {}) as Record<string, number>;
  data.bodyweightBaselines = migrate(data.bodyweightBaselines || {}) as Record<string, number>;
  if (data.assistanceHistory) {
    const newHistory = { ...data.assistanceHistory };
    Object.entries(ID_MIGRATE).forEach(([old, newKey]) => {
      if (newHistory[old]) {
        if (!newHistory[newKey]) newHistory[newKey] = [];
        newHistory[newKey] = [...newHistory[newKey], ...newHistory[old]].sort(
          (a, b) => (a.datetime || 0) - (b.datetime || 0),
        );
        delete newHistory[old];
        changed = true;
      }
    });
    data.assistanceHistory = newHistory;
  }
  void changed;
  return data;
}

export async function loadData(): Promise<ProgramData | null> {
  try {
    let stored = await window.storage.get(STORE_KEY);
    if (!stored) stored = await window.storage.get("531-v9");
    if (!stored) stored = await window.storage.get("531-v8");
    if (!stored) stored = await window.storage.get("531-v7");
    if (!stored) stored = await window.storage.get("531-v6");
    if (!stored) return null;
    const parsed = JSON.parse(stored.value);
    const migrated = migratePropertyNames(parsed) as unknown as ProgramData;
    return migrateAccIds(migrated);
  } catch {
    return null;
  }
}

export async function saveData(data: ProgramData): Promise<void> {
  try {
    await window.storage.set(STORE_KEY, JSON.stringify(data));
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
