# UI Component Patterns

Guidelines for creating components inside `src/components/ui/`.

## Stack

- **tailwind-variants** (`tv`) — variant definition and class merging
- **Tailwind CSS v4** — utility classes using design tokens registered in `@theme`
- **Typography** — JetBrains Mono for all monospaced text, system default fonts for regular text
- No `twMerge` directly in components — `tv` handles merging via the `className` prop

## File structure

One file per component. Named exports only, never `default export`.

```
src/components/ui/
├── button.tsx
├── badge.tsx
└── ...
```

## Component template

```tsx
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

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
  return <element className={componentName({ variant, size, className })} {...props} />;
}

export type { ComponentNameProps, ComponentNameVariants };
export { ComponentName, componentName };
```

## Rules

### 1. No `twMerge` in components
`tv` already resolves conflicts. Pass `className` directly to the `tv()` call:

```tsx
// correct
<button className={button({ variant, size, className })} />

// wrong
<button className={twMerge(button({ variant, size }), className)} />
```

### 2. Use design token classes, never raw values or `var()`
All tokens are registered in `globals.css` inside `@theme inline {}`, which makes
Tailwind generate utility classes automatically.

```tsx
// correct — token class
"bg-accent-green hover:bg-accent-green-hover"

// wrong — raw hex
"bg-[#10b981]"

// wrong — var() in class
"bg-[var(--color-accent-green)]"
```

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
  return <button className={button({ variant, size, className })} {...props} />;
}
```

### 6. Export both the component and the `tv` instance
Exporting `button` (the `tv` instance) allows other components to `extend` it
via `tv({ extend: button, ... })` when composing variants.

## Available design tokens

Defined in `src/app/globals.css` inside `@theme inline {}`.

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

### Typography

| Class       | Font                                              |
|-------------|---------------------------------------------------|
| `font-sans` | System default (sans-serif) — for regular text    |
| `font-mono` | JetBrains Mono — for code and monospaced text     |
