# DevRoast — Project Context for Claude

## What this is
A code-roasting web app where users paste code and get a brutal AI-generated review with a score (0–10). Built during the **NLW event by Rocketseat**.

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — config via `@theme {}` in `src/app/globals.css`, no `tailwind.config.ts`
- **tailwind-variants** (`tv`) + **tailwind-merge** (`cn` at `src/lib/cn.ts`) for class composition
- **Biome** for lint/format (`npm run check`)
- **Base UI** (`@base-ui-components/react`) for interactive primitives (Toggle, etc.)
- **Shiki** for server-side syntax highlighting (`CodeBlock.Body` is `async`)
- **JetBrains Mono** — only external font, loaded via `next/font`, mapped to `font-mono`

## Key file structure
```
src/
├── app/
│   ├── globals.css        — @theme {} with all design tokens
│   ├── layout.tsx         — Navbar + body wrapper
│   ├── page.tsx           — Homepage (static for now)
│   └── ui-preview/        — Component library visual reference
├── components/
│   ├── navbar.tsx         — Common header (server component)
│   ├── roast-form.tsx     — Code editor + toggle + submit ("use client")
│   └── ui/                — Reusable UI components (see CLAUDE.md inside)
└── lib/
    └── cn.ts              — twMerge utility
```

## Global rules

**Classes & tokens**
- Always use Tailwind utility classes (`bg-accent-green`), never `var(--color-...)` in JSX props
- Exception: SVG `stopColor` requires `style={{ stopColor: "var(--color-accent-green)" }}` since Tailwind classes don't apply to SVG attributes
- Never hardcode hex values — use tokens from `globals.css`

**className composition**
- Always use `cn()` from `@/lib/cn` — never template literals for className
- `tv()` instances: call as `cn(component({ variant, size }), className)`, not `component({ ..., className })`

**Components**
- Named exports only, never `default export` from `src/components/ui/`
- Atomic components use `tv()` + `cn()`. Composition pattern for components with 2+ distinct content areas (see Rule 12 in `src/components/ui/CLAUDE.md`)
- After creating a new component: add a `<Section>` for it in `src/app/ui-preview/page.tsx`
- Client components (`"use client"`) only when state/events/browser APIs are needed

**Fonts**
- `font-mono` → JetBrains Mono (code, labels, UI text in this app)
- `font-sans` → system default (general prose)
- Never set a custom font on `<body>` — it overrides everything

## Detailed component guidelines
→ `src/components/ui/CLAUDE.md`
