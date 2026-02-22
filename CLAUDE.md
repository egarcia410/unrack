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

## Polaris Stores
- Define stores with `createStore(name, { state, actions, init? })` from `src/stores/polaris`
- Consume state and actions via destructuring: `const { phase, phaseAdvanced } = useProgramStore()`
- Valtio proxy tracking gives granular reactivity — only accessed properties trigger re-renders
- Use `set({ key: value })` for partial merges, `set((s) => { s.key = value })` for mutations
- Extract `initialState` constant — reuse in store init and reset actions
- Every store property has a concrete initial value — no optional (`?`) properties in state types
- Use `false` for booleans, `0` for numbers, `""` for strings, `null` for data-carrying objects, `{}` for dynamic lookup maps
- Cross-store reads use `useOtherStore.getState()` inside actions
- Static access (route guards): `useProgramStore.getState()` or `useProgramStore.status("init")`
- Never use `.getState()` in components — only in store files, route guards, or exported static selectors

## Store Organization

### State types
- Store-internal state types (`ProgramState`, `WorkoutState`) stay inline — never export them
- Shared types that cross module boundaries live in `src/types.ts`

### Computed
- Use store `computed` for values derived from a single store's state (e.g. `activeLiftId` from `activeDay`, `template` from `templateId`)
- Do not use computed for cross-store derivations — use selector hooks instead
- Do not use computed when it would read most/all state properties (defeats granular reactivity)

### Static selectors
- Static selectors (`hasProgramData`, `hasActiveWorkout`) live in store files — for route guards and non-reactive contexts

### Selector hooks
- Name files `use-*-selectors.ts` (e.g. `use-workout-selectors.ts`, `use-home-selectors.ts`)
- Colocate with the consuming feature
- Use for cross-store derivations and parameterized queries
- Selector hooks read specific store properties — never pass the full store state to utility functions

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
- Components should never pull broad store data (`useProgramData()`) just to pass it into a function — encapsulate that in a hook
- Colocate selector hooks with the feature that consumes them (e.g. `src/features/workout/use-workout-selectors.ts`)
- Hooks can compose other hooks and read from multiple stores — they are the view model layer between stores and components
- Parameterized selectors are hooks that accept arguments (e.g. `useAccessoryExercise(exerciseIndex)`)
- Pure static constants and truly pure functions (no store data as input) are fine as standalone utilities in `src/lib/`
