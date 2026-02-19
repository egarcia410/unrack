import type { StoreApi, UseBoundStore } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { [K in keyof T]: () => T[K] }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>;
  for (const key of Object.keys(store.getState())) {
    if (!(key in store)) {
      (store as Record<string, unknown>)[key] = () =>
        store((state) => state[key as keyof typeof state]);
    }
  }
  return store;
};
