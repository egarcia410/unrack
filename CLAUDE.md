# Project Conventions

## Imports
- Use Base UI subpath imports (`@base-ui/react/field`, `@base-ui/react/number-field`) not the root (`@base-ui/react`)

## Styling
- Do not use arbitrary Tailwind values (e.g. `w-[120px]`, `text-[#ff0000]`) — use the design system tokens and standard utility classes

## Naming
- Use descriptive, self-documenting variable and property names
- No single-character or heavily abbreviated names — code should be readable years later
- Example: `trainingMax` not `tm`, `inputValue` not `val`, `oneRepMaxes` not `orms`
