// ============================================================================
// Polaris — Computed (resolve & applyComputed)
// ============================================================================

import { memoize } from "proxy-memoize";
import type { ComputedMap } from "./types";

export type ResolvedComputedMap = ReadonlyArray<readonly [string, (state: any) => unknown]>;

export const resolve = <TState>(
  _initial: TState,
  computedDefs?: ComputedMap<TState>,
): ResolvedComputedMap => {
  if (!computedDefs) return [];

  return Object.entries(computedDefs).map(([key, fn]) => {
    if (typeof fn !== "function") {
      throw new Error(`[Polaris] Computed "${key}" must be a function.`);
    }
    return [key, memoize(fn as (state: object) => unknown)] as const;
  });
};

export const applyComputed = <TState>(
  snapshot: TState,
  entries: ResolvedComputedMap,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, fn] of entries) {
    result[key] = fn(snapshot);
  }
  return result;
};
