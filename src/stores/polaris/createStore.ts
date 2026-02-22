// ============================================================================
// Polaris — createStore (Valtio engine + Plugin system)
// ============================================================================

import { proxy, useSnapshot, subscribe as valtioSubscribe, snapshot } from "valtio";
import { devtools } from "valtio/utils";
import { StatusTracker } from "./status";
import { resolve, applyComputed } from "./computed";
import type {
  StoreDefinition,
  StoreHook,
  StoreHookReturn,
  StorePlugin,
  PluginContext,
  ComputedMap,
  ActionCreator,
  BoundActions,
  SetState,
  Status,
} from "./types";

const RESERVED = new Set(["status"]);

export function createStore<
  TState extends Record<string, any>,
  TComputed extends ComputedMap<TState> = {},
  TCreator extends ActionCreator<TState> = ActionCreator<TState>,
>(
  name: string,
  def: StoreDefinition<TState, TComputed, TCreator>,
): StoreHook<TState, TComputed, ReturnType<TCreator>> {
  type TActions = ReturnType<TCreator>;

  const {
    state: initial,
    computed: computedDefs,
    actions: actionCreator,
    plugins: pluginDefs = [],
    devtools: useDevtools = false,
  } = def;

  // --- Valtio proxy state ---
  const state = proxy<TState>({ ...initial });

  // --- Devtools ---
  if (useDevtools) {
    devtools(state, { name });
  }

  // --- Status ---
  const tracker = new StatusTracker();
  const statusProxy = proxy<{ current: Status }>({ current: tracker.build() });

  // --- Computed ---
  const computedMap = resolve(initial, computedDefs);

  // --- Plugin context (set is forward-referenced) ---
  const get = (): TState => snapshot(state) as TState;
  let set: SetState<TState>;

  const ctx: PluginContext<TState> = {
    get storeName() {
      return name;
    },
    get,
    set: (...args: any[]) => (set as any)(...args),
  };

  // --- Plugin runner ---
  const runHook = (hook: keyof StorePlugin<TState>, ...args: any[]) => {
    for (const plugin of pluginDefs) {
      const fn = plugin[hook];
      if (typeof fn === "function") {
        (fn as Function)(ctx, ...args);
      }
    }
  };

  // onSet can transform partials — runs each plugin in order
  const runOnSet = (partial: Partial<TState>): Partial<TState> => {
    let current = partial;
    for (const plugin of pluginDefs) {
      if (plugin.onSet) {
        const result = plugin.onSet(ctx, current);
        if (result !== undefined && result !== null) {
          current = result;
        }
      }
    }
    return current;
  };

  // --- Build set (with plugin hooks) ---
  set = ((partialOrMutator: Partial<TState> | ((s: TState) => void)) => {
    if (typeof partialOrMutator === "function") {
      (partialOrMutator as (s: TState) => void)(state);
      runHook("afterSet");
    } else {
      const transformed = runOnSet(partialOrMutator);
      Object.assign(state, transformed);
      runHook("afterSet");
    }
  }) as SetState<TState>;

  // --- Status: wire up proxy sync + plugin hooks ---
  tracker.onChange(() => {
    statusProxy.current = tracker.build();
  });

  const _setPending = tracker.setPending.bind(tracker);
  const _setSuccess = tracker.setSuccess.bind(tracker);
  const _setError = tracker.setError.bind(tracker);

  tracker.setPending = (n: string) => {
    _setPending(n);
    runHook("onStatusChange", n, {
      value: "pending",
      pending: true,
      error: null,
      success: false,
      idle: false,
    });
  };
  tracker.setSuccess = (n: string) => {
    _setSuccess(n);
    runHook("onStatusChange", n, {
      value: "success",
      pending: false,
      error: null,
      success: true,
      idle: false,
    });
  };
  tracker.setError = (n: string, error: Error) => {
    _setError(n, error);
    runHook("onStatusChange", n, {
      value: "error",
      pending: false,
      error,
      success: false,
      idle: false,
    });
  };

  // --- Create raw actions ---
  const rawActions = actionCreator(set, get);

  // --- Validate names ---
  const allNames = new Set<string>();
  const register = (key: string, _source: string) => {
    if (RESERVED.has(key)) {
      throw new Error(`[Statekit] "${key}" is reserved and cannot be used in store "${name}".`);
    }
    if (allNames.has(key)) {
      throw new Error(`[Statekit] "${key}" is defined more than once in store "${name}".`);
    }
    allNames.add(key);
  };

  for (const key of Object.keys(initial)) register(key, "state");
  if (computedDefs) {
    for (const key of Object.keys(computedDefs)) {
      if (!(key in initial)) register(key, "computed");
    }
  }
  for (const key of Object.keys(rawActions)) register(key, "action");

  // --- Wrap actions: plugin hooks + async status ---
  const boundActions = {} as BoundActions<TActions>;

  for (const [actionName, actionFn] of Object.entries(rawActions)) {
    (boundActions as any)[actionName] = (...args: any[]): any => {
      runHook("onAction", actionName, args);

      try {
        const result = (actionFn as Function)(...args);

        if (!result || typeof result.then !== "function") {
          runHook("afterAction", actionName, args);
          return;
        }

        tracker.setPending(actionName);

        return (result as Promise<any>)
          .then(() => {
            tracker.setSuccess(actionName);
            runHook("afterAction", actionName, args);
          })
          .catch((err: unknown) => {
            const error = err instanceof Error ? err : new Error(String(err));
            tracker.setError(actionName, error);
            runHook("afterAction", actionName, args, error);
            throw error;
          });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        tracker.setError(actionName, error);
        runHook("afterAction", actionName, args, error);
        throw error;
      }
    };
  }

  // --- Plugin: onInit (before user init) ---
  runHook("onInit");

  // --- Lazy init ---
  let _initRun = false;
  const triggerInit = () => {
    if (_initRun || !def.init) return;
    _initRun = true;
    tracker.setPending("init");
    try {
      const result = def.init(set, get);
      if (!result || typeof result.then !== "function") {
        tracker.setSuccess("init");
        return;
      }
      (result as Promise<void>)
        .then(() => tracker.setSuccess("init"))
        .catch((err: unknown) => {
          tracker.setError("init", err instanceof Error ? err : new Error(String(err)));
        });
    } catch (err) {
      tracker.setError("init", err instanceof Error ? err : new Error(String(err)));
    }
  };

  // --- Subscribe ---
  const subscribe = (listener: (state: TState, status: Status) => void) => {
    const u1 = valtioSubscribe(state, () => listener(snapshot(state) as TState, tracker.build()));
    const u2 = tracker.onChange(() => listener(snapshot(state) as TState, tracker.build()));
    return () => {
      u1();
      u2();
    };
  };

  // --- Destroy ---
  let _destroyed = false;
  const destroy = () => {
    if (_destroyed) return;
    _destroyed = true;
    runHook("onDestroy");
    def.cleanup?.(get);
  };

  // =====================================================================
  // THE HOOK
  // =====================================================================

  const stateKeys = Object.keys(initial);

  function useHook(): StoreHookReturn<TState, TComputed, TActions> {
    if (!_initRun && def.init) triggerInit();
    const snap = useSnapshot(state) as TState;
    const statusSnap = useSnapshot(statusProxy);
    const computed = applyComputed(snap, computedMap);
    const result = { ...computed, ...boundActions, status: statusSnap.current };
    for (const key of stateKeys) {
      Object.defineProperty(result, key, {
        get: () => (snap as any)[key],
        enumerable: true,
      });
    }
    return result as StoreHookReturn<TState, TComputed, TActions>;
  }

  // --- Static properties ---
  const hook = useHook as StoreHook<TState, TComputed, TActions>;

  Object.defineProperties(hook, {
    getState: { value: get, enumerable: true },
    set: { value: set, enumerable: true },
    actions: { get: () => boundActions, enumerable: true },
    status: { get: () => tracker.build(), enumerable: true },
    subscribe: { value: subscribe, enumerable: true },
    destroy: { value: destroy, enumerable: true },
    name: { get: () => name, enumerable: true },
  });

  return hook;
}
