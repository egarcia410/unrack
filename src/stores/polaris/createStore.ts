import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type PersistOptions<T> = {
  key: string;
  partialize: (state: T) => Partial<T>;
  version?: number;
  migrate?: (persisted: unknown, version: number) => unknown;
  onRehydrateStorage?: (state: T) => ((state?: T, error?: unknown) => void) | void;
};

type StoreOptions<T> = {
  persist?: PersistOptions<T>;
};

export const createStore = <T extends Record<string, unknown>>(
  name: string,
  initialState: T,
  options?: StoreOptions<T>,
) => {
  const devtoolsOptions = { name, enabled: import.meta.env.DEV };

  if (options?.persist) {
    const persistOpts = options.persist;
    return create<T>()(
      devtools(
        persist(subscribeWithSelector(immer(() => ({ ...initialState }))), {
          name: persistOpts.key,
          version: persistOpts.version,
          partialize: persistOpts.partialize as (state: T) => T,
          migrate: persistOpts.migrate as ((state: unknown, version: number) => T) | undefined,
          onRehydrateStorage: persistOpts.onRehydrateStorage,
        }),
        devtoolsOptions,
      ),
    );
  }

  return create<T>()(
    devtools(subscribeWithSelector(immer(() => ({ ...initialState }))), devtoolsOptions),
  );
};
