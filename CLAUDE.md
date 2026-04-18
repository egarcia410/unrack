# Project Conventions

## Imports
- Use Base UI subpath imports (`@base-ui/react/field`, `@base-ui/react/number-field`) not the root (`@base-ui/react`)

## Styling
- Do not use arbitrary Tailwind values (e.g. `w-[120px]`, `text-[#ff0000]`) — use the design system tokens and standard utility classes

## Icons
- Use lucide-react icons instead of Unicode characters, symbols, or HTML entities (e.g. `<ChevronDown />` not `▼`, `<ArrowRight />` not `→`)

## Components
- Use Base UI components whenever possible instead of raw HTML elements
- Use arrow function components: `const MyComponent = () => { }` not `function MyComponent() { }`

## TypeScript
- Prefer string union types over bare `string` whenever the set of values is known (e.g. `"lb" | "kg"` not `string`)

## Naming
- Use descriptive, self-documenting variable and property names
- No single-character or heavily abbreviated names — code should be readable years later
- Example: `trainingMax` not `tm`, `inputValue` not `val`, `oneRepMaxes` not `orms`

## Polaris Stores (Zustand)
- Define stores with `createStore(name, initialState, options?)` from `src/stores/polaris` — wraps Zustand with Immer, devtools, subscribeWithSelector, and optional persist middleware
- Consume state via per-field selector hooks: `const phase = usePhase()`, `const template = useTemplate()` — never `useStore()` with no selector (breaks fine-grained subscription)
- Actions are standalone named exports — import and call directly: `import { phaseAdvanced } from "../stores/polaris"; phaseAdvanced()`
- Inside actions: read via `useStore.getState()`, write via `useStore.setState(partial)` or `useStore.setState((draft) => { ... })` (Immer-powered)
- Extract `initialState` constant — reuse in store setup and `reset*Store()` helpers
- Every store property has a concrete initial value — no optional (`?`) properties in state types
- Use `false` for booleans, `0` for numbers, `""` for strings, `null` for data-carrying objects, `{}` for dynamic lookup maps
- Cross-store reads: `useOtherStore.getState()` inside actions
- Cross-store writes: import the other store's action (e.g. `setActiveCelebration`) or call `useOtherStore.setState(...)` directly
- Static access (route guards): `useStore.getState()` or exported helpers like `hasProgramData()`, `hasActiveWorkout()`
- Never use `.getState()` in components — only in store files, route guards, or exported static selectors
- Actions are commands — they always return `void`, never values

## Store Organization

### File layout
- Each store is a directory: `src/stores/polaris/{program,workout,overlay}/` with `*.store.ts`, `*.actions.ts`, `*.selectors.ts`, `*.types.ts`
- Central re-exports in `src/stores/polaris/index.ts` — consumers import from there

### State types
- Store-internal state types (`ProgramState`, `WorkoutState`) live in `*.types.ts`, exported for cross-store action typing; not consumed by components
- Shared types that cross module boundaries live in `src/types.ts`

### Derived selectors (per-store)
- For single-store derivations, export a selector hook from `*.selectors.ts` (e.g. `useTemplate`, `useCurrentPhase`, `useCurrentPhaseWorkouts`) — use `useMemo` when deriving from multiple fields
- Do not read most/all state properties in one hook (defeats granular reactivity)

### Static selectors
- Static selectors (`hasProgramData`, `hasActiveWorkout`) are non-hook helpers in `*.selectors.ts` — for route guards and non-reactive contexts

### Feature-level selector hooks
- Name files `use-*-selectors.ts` (e.g. `use-workout-selectors.ts`, `use-home-selectors.ts`)
- Colocate with the consuming feature
- Use for cross-store derivations and parameterized queries
- Selector hooks read specific store properties via atomic hooks — never call `useStore()` without a selector

## Overlay State Naming
- `show*` prefix for boolean open/close state (e.g. `showSettings`, `showDeleteConfirm`)
- `active*` prefix for data-carrying overlay state where `null` = closed (e.g. `activeCelebration`, `activeSwapSlot`)

## Component Naming
- Dialogs: `*Dialog` suffix (e.g. `DeleteConfirmDialog`, `CelebrationDialog`)
- Drawers: `*Drawer` suffix (e.g. `SettingsDrawer`, `TemplatePickerDrawer`)
- Collapsible sections: `*Section` suffix (e.g. `WarmupSection`, `AssistanceSection`)

## Conditional Styling
- Use CVA variants for conditional class logic when a component has discrete visual states
- Compose CVA with `cn()` for merging variant classes with additional overrides: `cn(myVariants({ status }), "extra-class")`

## Derived State & Selectors
- Derive computed values from stores using composed selector hooks — not helper functions that take store data as arguments
- Components should never call a store hook without a selector and pass the whole state into a function — encapsulate that in a selector hook
- Colocate selector hooks with the feature that consumes them (e.g. `src/features/workout/use-workout-selectors.ts`)
- Hooks can compose other hooks and read from multiple stores — they are the view model layer between stores and components
- Parameterized selectors are hooks that accept arguments (e.g. `useAccessoryExercise(exerciseIndex)`)
- Pure static constants and truly pure functions (no store data as input) are fine as standalone utilities in `src/lib/`
