# DevRoast

A Next.js application for code reviews with style and personality.

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with CSS-based configuration
- **Component Library**: Custom UI components using `tailwind-variants`
- **Typography**: JetBrains Mono for all monospaced text, system defaults for regular text
- **Code Quality**: Biome for linting and formatting

## Architecture

### Design Tokens

All design tokens are defined in `src/app/globals.css` using Tailwind CSS v4's `@theme` directive. This includes:

- **Colors**: Background, text, border, and accent colors
- **Typography**: Font families using system defaults and JetBrains Mono
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl)

### Components

Components are located in `src/components/ui/` and follow these patterns:

- Built with React and TypeScript
- Use `tailwind-variants` for variant management
- Styled with Tailwind CSS design tokens
- Named exports only (never default exports)

#### Typography Standards

- **Regular Text**: Uses system default sans-serif font via `font-sans`
- **Monospaced Text**: Uses JetBrains Mono via `font-mono` class
- No external monospace fonts beyond JetBrains Mono
- All text styling uses Tailwind utility classes, not CSS variables directly

### UI Component Guidelines

See [src/components/ui/AGENTS.md](src/components/ui/AGENTS.md) for detailed component patterns and rules.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run check` - Run Biome checks with fixes

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)
