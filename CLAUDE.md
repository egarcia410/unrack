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

## Zustand Stores
- Wrap stores with `createSelectors` (`src/lib/create-selectors.ts`) — generates `store.field()` selectors
- Consume state as `useXStore.field()`, actions as `useXStore.actions()`
- Separate `type XState` (data) from `type XActions` (methods), nest actions under `actions` key
- Extract `initialState` constant — reuse in store init and reset actions
- Never use inline selectors (`useStore((s) => s.foo)`) in components
- Never use `.getState()` outside store files — export static selectors for non-React contexts (route guards)
