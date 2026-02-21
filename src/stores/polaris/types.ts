// ============================================================================
// Polaris — Types (Valtio engine)
// ============================================================================

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type StatusValue = "idle" | "pending" | "success" | "error";

export interface Status {
  readonly value: StatusValue;
  readonly pending: boolean;
  readonly error: Error | null;
  readonly success: boolean;
  readonly idle: boolean;
  (name: string): OperationStatus;
}

export interface OperationStatus {
  readonly value: StatusValue;
  readonly pending: boolean;
  readonly error: Error | null;
  readonly success: boolean;
  readonly idle: boolean;
}

export interface OperationRecord {
  status: StatusValue;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// State mutator
// ---------------------------------------------------------------------------

/**
 * Mutate state directly — Valtio's proxy handles reactivity.
 *
 *   set(s => { s.items.push(todo) })     → mutate (no return needed)
 *   set({ filter: 'active' })            → shallow merge
 */
export type SetState<TState> = {
  (partial: Partial<TState>): void;
  (mutator: (state: TState) => void): void;
};

export type GetState<TState> = () => TState;

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

export type ComputedFn<TState> = (state: TState) => any;
export type ComputedMap<TState> = Record<string, ComputedFn<TState>>;

export type ResolvedComputed<TState, TComputed extends ComputedMap<TState>> = {
  [K in keyof TComputed]: TComputed[K] extends (state: TState) => infer R ? R : never;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type ActionCreator<TState> = (
  set: SetState<TState>,
  get: GetState<TState>,
) => Record<string, (...args: any[]) => any>;

export type BoundActions<TActions extends Record<string, (...args: any[]) => any>> = {
  [K in keyof TActions]: TActions[K] extends (...args: infer P) => infer R
    ? (...args: P) => R extends Promise<any> ? Promise<void> : R
    : never;
};

// ---------------------------------------------------------------------------
// Plugins
// ---------------------------------------------------------------------------

export interface PluginContext<TState = any> {
  /** Store name */
  readonly storeName: string;
  /** Read current state (snapshot) */
  get: GetState<TState>;
  /** Mutate state */
  set: SetState<TState>;
}

export interface StorePlugin<TState = any> {
  /** Unique plugin name */
  name: string;

  /** Store created — runs once, before init */
  onInit?: (ctx: PluginContext<TState>) => void;

  /** Store destroyed */
  onDestroy?: (ctx: PluginContext<TState>) => void;

  /** Before state mutation. Return a modified partial to transform, or void to pass through. */
  onSet?: (ctx: PluginContext<TState>, next: Partial<TState>) => Partial<TState> | void;

  /** After state mutation (read-only, for logging/persistence/sync) */
  afterSet?: (ctx: PluginContext<TState>) => void;

  /** Before action executes */
  onAction?: (ctx: PluginContext<TState>, actionName: string, args: any[]) => void;

  /** After action completes (error is set if it threw) */
  afterAction?: (
    ctx: PluginContext<TState>,
    actionName: string,
    args: any[],
    error?: Error,
  ) => void;

  /** Async status changed */
  onStatusChange?: (
    ctx: PluginContext<TState>,
    actionName: string,
    status: OperationStatus,
  ) => void;
}

// ---------------------------------------------------------------------------
// Store Definition
// ---------------------------------------------------------------------------

export interface StoreDefinition<
  TState extends Record<string, any>,
  TComputed extends ComputedMap<TState>,
  TCreator extends ActionCreator<TState>,
> {
  state: TState;
  computed?: TComputed;
  actions: TCreator;
  plugins?: StorePlugin<TState>[];
  init?: (set: SetState<TState>, get: GetState<TState>) => void | Promise<void>;
  cleanup?: (get: GetState<TState>) => void;
  devtools?: boolean;
}

// ---------------------------------------------------------------------------
// Store Hook Return — flat namespace
// ---------------------------------------------------------------------------

export type StoreHookReturn<
  TState extends Record<string, any>,
  TComputed extends ComputedMap<TState>,
  TActions extends Record<string, (...args: any[]) => any>,
> = TState & ResolvedComputed<TState, TComputed> & BoundActions<TActions> & { status: Status };

// ---------------------------------------------------------------------------
// Store Hook
// ---------------------------------------------------------------------------

export interface StoreHook<
  TState extends Record<string, any>,
  TComputed extends ComputedMap<TState>,
  TActions extends Record<string, (...args: any[]) => any>,
> {
  (): StoreHookReturn<TState, TComputed, TActions>;
  getState: () => TState;
  set: SetState<TState>;
  actions: BoundActions<TActions>;
  status: Status;
  subscribe: (listener: (state: TState, status: Status) => void) => () => void;
  destroy: () => void;
  readonly name: string;
}
