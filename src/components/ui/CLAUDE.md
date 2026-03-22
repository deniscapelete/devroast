# UI Component Patterns

Guidelines for creating components inside `src/components/ui/`.

## Stack

- **tailwind-variants** (`tv`) — variant definition and class merging
- **tailwind-merge** (`twMerge`) — explicit class conflict resolution via the `cn` utility at `src/lib/cn.ts`
- **Tailwind CSS v4** — utility classes using design tokens registered in `@theme` in `globals.css`
- **Typography** — `font-mono` (JetBrains Mono) for monospaced text; `font-sans` (system default) for regular text — no external sans font

## File structure

One file per component. Named exports only, never `default export`.

```
src/
├── lib/
│   └── cn.ts            — twMerge utility, import from "@/lib/cn"
└── components/ui/
    ├── badge.tsx        — colored dot + label, variants: critical/warning/good/info
    ├── button.tsx       — primary/secondary/ghost/destructive, sm/md/lg
    ├── card.tsx         — badge + title + description, bordered
    ├── code-block.tsx   — server component, shiki vesper, macOS chrome header
    ├── diff-line.tsx    — added/removed/context line types
    ├── score-ring.tsx   — SVG arc, green→amber gradient, neutral text colors
    ├── table-row.tsx    — rank + score + code preview + lang
    ├── toggle.tsx       — base-ui Switch, on/off with label
    └── CLAUDE.md
```

## Component template

```tsx
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const componentName = tv({
  base: [
    // shared classes for all variants
  ],
  variants: {
    variant: {
      primary: "...",
      secondary: "...",
    },
    size: {
      sm: "...",
      md: "...",
      lg: "...",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ComponentNameVariants = VariantProps<typeof componentName>;

type ComponentNameProps = ComponentProps<"element"> & ComponentNameVariants;

function ComponentName({ variant, size, className, ...props }: ComponentNameProps) {
  return <element className={cn(componentName({ variant, size }), className)} {...props} />;
}

export type { ComponentNameProps, ComponentNameVariants };
export { ComponentName, componentName };
```

## Rules

### 1. Always use `cn` for className merging
Import `cn` from `@/lib/cn` and use it everywhere className is composed — whether using `tv()` or plain strings. Never use template literals for className composition.

```tsx
// correct — explicit cn merge
import { cn } from "@/lib/cn";
<button className={cn(button({ variant, size }), className)} />

// correct — cn for plain string composition
<div className={cn("base-classes", className)} />

// wrong — tv internal merge (hides twMerge usage)
<button className={button({ variant, size, className })} />

// wrong — template literal (no conflict resolution)
<div className={`base-class ${className ?? ""}`} />
```

### 2. Use design token classes, never raw values or `var()`
All tokens are registered in `globals.css` inside `@theme {}`, which makes
Tailwind generate utility classes automatically.

```tsx
// correct — token class
"bg-accent-green hover:bg-accent-green-hover"

// wrong — raw hex
"bg-[#10b981]"

// wrong — var() in bracket notation
"bg-[var(--color-accent-green)]"

// acceptable — canonical Tailwind v4 shorthand when a token class doesn't exist
"bg-(--color-accent-green)"
```

**SVG exception:** SVG attributes like `stopColor` do not accept Tailwind classes.
Use `style={{ stopColor: "var(--color-accent-green)" }}` since `@theme` (without `inline`)
emits CSS custom properties to `:root`, making them available at runtime.

> **Biome rule `suggestCanonicalClasses`** fires in two cases:
> 1. `text-[var(--x)]` → prefer `text-(--x)` (canonical v4 shorthand)
> 2. `text-(--color-white)` → prefer `text-white` (native Tailwind utility already exists)
>
> Rule of thumb: if Tailwind ships a utility for the value (e.g. `white`, `black`,
> `transparent`), use the utility directly. Only use `(--variable)` shorthand for
> custom tokens that have no native utility.

### 3. Every interactive state needs a token color, not opacity
Hover, active and focus states must use explicit color tokens, not `opacity` modifiers.

```tsx
// correct
"bg-destructive hover:bg-destructive-hover"

// wrong
"bg-destructive hover:opacity-90"
```

### 4. Named exports only

```tsx
// correct
export { Button, button };
export type { ButtonProps, ButtonVariants };

// wrong
export default Button;
```

### 5. Extend the native HTML element props
Always spread the native element props so consumers can use all native attributes
(e.g. `onClick`, `disabled`, `aria-*`, `data-*`).

```tsx
type ButtonProps = ComponentProps<"button"> & ButtonVariants;

function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

### 6. Export both the component and the `tv` instance
Exporting `button` (the `tv` instance) allows other components to `extend` it
via `tv({ extend: button, ... })` when composing variants.

### 7. Use base-ui primitives for interactive behavior
Components that need keyboard navigation, ARIA roles, or state management
(toggle, checkbox, select, dialog, etc.) must use `@base-ui-components/react`
as the primitive. Style via `data-[checked]:`, `data-[open]:`, etc. attributes.

```tsx
// correct — base-ui handles ARIA + keyboard, Tailwind handles styles
import { Switch } from "@base-ui-components/react/switch";

<Switch.Root className="bg-border-primary data-[checked]:bg-accent-green">
  <Switch.Thumb className="translate-x-0 data-[checked]:translate-x-[18px]" />
</Switch.Root>
```

### 8. Server components vs. client components
- Default to **server components** (no `"use client"`).
- Add `"use client"` only when the component uses browser APIs, event handlers,
  or interactive primitives (e.g. Toggle via base-ui Switch).
- `CodeBlock` is a server component: it is `async` and calls `codeToHtml` from
  shiki at request time. Never add `"use client"` to it.

### 9. Slots in tailwind-variants
When a component has multiple styled elements, use `tv` slots. Extract slot functions
and compose the root slot with `cn`:

```tsx
const badge = tv({
  slots: { root: "...", dot: "...", text: "..." },
  variants: { variant: { critical: { dot: "bg-accent-red", text: "text-accent-red" } } },
});

// Usage in component:
const { root, dot, text } = badge({ variant });
<div className={cn(root(), className)}>
  <span className={dot()} />
  <span className={text()}>{label}</span>
</div>
```

### 10. Components without variants
Simple display components with no variants don't need `tv()`. Export just the
component function. Always use `cn` for className composition. Inline styles are
acceptable only for computed values derived from props (e.g. font sizes scaled to
a `size` prop in ScoreRing).

### 12. Composition pattern for components with multiple content areas
Components with 2 or more independent content areas (title, body, header, description, etc.)
must be implemented as a namespace of sub-components instead of accumulating content props.

Indicators that composition is needed:
- Props `title: string`, `description: string`, `header: ReactNode` → content that may need markup
- Two visually distinct sections with their own styles (e.g. chrome header + code body)

```tsx
// ❌ wrong — props accumulating content
<Card title="foo" description="bar" badge="critical" />

// ✅ correct — composition
<Card.Root>
  <Badge variant="critical" />
  <Card.Title>foo</Card.Title>
  <Card.Description>bar</Card.Description>
</Card.Root>
```

Export via namespace object (do NOT use default export):
```tsx
const Card = { Root: CardRoot, Title: CardTitle, Description: CardDescription };
export { Card, card };
```

Atomic components (single element, tightly coupled internal logic) do NOT need composition:
`Button`, `Badge`, `Toggle`, `ScoreRing`, `DiffLine`, `TableRow`.

### 13. Add every new reusable component to the UI preview page
After creating a component in `src/components/ui/`, add a dedicated `<Section>` for it
in `src/app/ui-preview/page.tsx` showing all its variants, sizes, and states.
The section must include `path="src/components/ui/<component-file>.tsx"`.

## Available design tokens

Defined in `src/app/globals.css` inside `@theme {}`.

### Colors

| Token class              | Value     | Usage                        |
|--------------------------|-----------|------------------------------|
| `bg-bg-page`             | `#0a0a0a` | Page background              |
| `bg-bg-surface`          | `#0f0f0f` | Card / panel background      |
| `bg-bg-elevated`         | `#1a1a1a` | Elevated surface             |
| `bg-bg-input`            | `#111111` | Input background             |
| `border-border-primary`  | `#2a2a2a` | Default border               |
| `border-border-secondary`| `#252525` | Subtle border                |
| `border-border-focus`    | `#10b981` | Focus ring border            |
| `text-text-primary`      | `#fafafa` | Primary text                 |
| `text-text-secondary`    | `#6b7280` | Secondary / muted text       |
| `text-text-tertiary`     | `#4b5563` | Tertiary text                |
| `bg-accent-green`        | `#10b981` | Primary action               |
| `bg-accent-green-hover`  | `#34d399` | Hover state for green        |
| `bg-accent-red`          | `#ef4444` | Danger accent                |
| `bg-accent-red-hover`    | `#f87171` | Hover state for red          |
| `bg-accent-amber`        | `#f59e0b` | Warning accent               |
| `bg-accent-amber-hover`  | `#fbbf24` | Hover state for amber        |
| `bg-accent-cyan`         | `#06b6d4` | Info accent                  |
| `bg-accent-cyan-hover`   | `#22d3ee` | Hover state for cyan         |
| `bg-destructive`         | `#ff5c33` | Destructive action           |
| `bg-destructive-hover`   | `#ff7a57` | Hover state for destructive  |
| `bg-diff-removed-bg`     | `#1a0a0a` | Diff removed line background |
| `bg-diff-added-bg`       | `#0a1a0f` | Diff added line background   |

### Typography

| Class       | Font                                              |
|-------------|---------------------------------------------------|
| `font-sans` | System default (sans-serif) — for regular text    |
| `font-mono` | JetBrains Mono — for code and monospaced text     |

**Rules:**
- Never use `font-primary`, `font-secondary` or other custom font class names.
  Use Tailwind's built-in `font-sans` and `font-mono` exclusively.
- JetBrains Mono is the only external font loaded. It is mapped to `--font-mono`
  in `@theme` so that `font-mono` works as expected.
- The body default is the system sans-serif stack (Tailwind `font-sans`).
  Do **not** force `font-family: var(--font-jetbrains-mono)` on the body — that
  overrides the default for all text, not just monospaced elements.
