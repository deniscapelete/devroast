# Leaderboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static leaderboard page with a live SSR-backed view showing the 20 worst-scoring roasts, reusing the existing collapsible + Shiki UI pattern, with real stats from the database.

**Architecture:** Add two tRPC procedures (`getLeaderboard` and a fixed `getStats`), create a `LeaderboardList` server component following the same pattern as `ShameLeaderboard`, and replace the static leaderboard page with SSR-prefetched dynamic components.

**Tech Stack:** Next.js App Router (server components), tRPC v11, Drizzle ORM, TanStack Query v5, Shiki (via `CodeBlock.Body`), Tailwind CSS v4.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/trpc/routers/roasts.ts` | Modify | Add `getLeaderboard`; replace hardcoded `getStats` with real DB query |
| `src/components/leaderboard-list.tsx` | Create | Server component rendering 20 `ShameLeaderboardRow` entries + `LeaderboardListSkeleton` |
| `src/app/leaderboard/page.tsx` | Modify | Replace static data with SSR prefetch + dynamic components |

---

## Task 1: Fix `getStats` with real DB query

**Files:**
- Modify: `src/trpc/routers/roasts.ts`

The `getStats` procedure currently returns hardcoded values. Replace it with a real aggregation query. This fixes both the homepage `StatsNumbers` component and the leaderboard page simultaneously.

- [ ] **Step 1: Update imports in `roasts.ts`**

Open `src/trpc/routers/roasts.ts`. Change the import line from:

```ts
import { asc, count, eq } from "drizzle-orm";
```

to:

```ts
import { asc, avg, count, eq } from "drizzle-orm";
```

- [ ] **Step 2: Replace `getStats` implementation**

Replace the entire `getStats` procedure body:

```ts
getStats: baseProcedure.query(async ({ ctx }) => {
  const [result] = await ctx.db
    .select({
      total: count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts);

  return {
    total: Number(result.total),
    avgScore: parseFloat(result.avgScore ?? "0"),
  };
}),
```

- [ ] **Step 3: Verify the dev server compiles without errors**

Run: `npm run dev`
Expected: No TypeScript or build errors in the terminal. Homepage stats numbers should now animate from 0 to the real DB count/avg.

- [ ] **Step 4: Commit**

```bash
git add src/trpc/routers/roasts.ts
git commit -m "fix: replace hardcoded getStats with real DB aggregation"
```

---

## Task 2: Add `getLeaderboard` tRPC procedure

**Files:**
- Modify: `src/trpc/routers/roasts.ts`

- [ ] **Step 1: Add `getLeaderboard` to the router**

Add the following procedure inside `createTRPCRouter({...})` in `src/trpc/routers/roasts.ts`, after the `getShameLeaderboard` procedure:

```ts
getLeaderboard: baseProcedure.query(async ({ ctx }) => {
  const rows = await ctx.db
    .select({
      code: roasts.code,
      language: roasts.language,
      score: roasts.score,
      lineCount: roasts.lineCount,
    })
    .from(roasts)
    .orderBy(asc(roasts.score))
    .limit(20);

  return rows.map((row, i) => ({
    rank: i + 1,
    score: parseFloat(row.score),
    lang: row.language,
    lineCount: row.lineCount,
    code: row.code,
  }));
}),
```

No `onLeaderboard` filter — returns the 20 lowest scores across all roasts.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/roasts.ts
git commit -m "feat: add getLeaderboard tRPC procedure (top 20 worst scores)"
```

---

## Task 3: Create `LeaderboardList` server component

**Files:**
- Create: `src/components/leaderboard-list.tsx`

This follows the exact same pattern as `src/components/shame-leaderboard.tsx`. It fetches 20 rows and renders each using `ShameLeaderboardRow` (already built, no changes needed).

- [ ] **Step 1: Create the file**

Create `src/components/leaderboard-list.tsx` with the following content:

```tsx
import { CodeBlock } from "@/components/ui/code-block";
import { getQueryClient, trpc } from "@/trpc/server";
import { ShameLeaderboardRow } from "./shame-leaderboard-row";

function SkeletonCard() {
	return (
		<div className="animate-pulse border border-border-primary">
			<div className="flex items-center gap-4 border-b border-border-primary bg-bg-surface px-5 py-3">
				<span className="block h-3 w-6 rounded-sm bg-bg-elevated" />
				<span className="block h-3 w-20 rounded-sm bg-bg-elevated" />
				<span className="flex-1" />
				<span className="block h-3 w-24 rounded-sm bg-bg-elevated" />
			</div>
			<div className="flex bg-bg-input">
				<div className="flex w-10 shrink-0 flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-[14px]">
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
				</div>
				<div className="flex-1 space-y-1.5 px-4 py-[14px]">
					<span className="block h-2 w-3/4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-1/2 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-2/3 rounded-sm bg-bg-elevated" />
				</div>
			</div>
		</div>
	);
}

export function LeaderboardListSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 20 }, (_, i) => (
				<SkeletonCard key={`skeleton-${i}`} />
			))}
		</div>
	);
}

export async function LeaderboardList() {
	const queryClient = getQueryClient();
	const data = await queryClient.fetchQuery(
		trpc.roasts.getLeaderboard.queryOptions(),
	);

	const codeClassName =
		"px-4 py-[14px] text-[12px] [&_pre]:leading-[18px] [&_code]:leading-[18px]";

	return (
		<div className="flex flex-col gap-3">
			{data.map((row) => {
				const previewCode = row.code.split("\n").slice(0, 5).join("\n");
				return (
					<ShameLeaderboardRow
						key={row.rank}
						rank={row.rank}
						score={row.score}
						lang={row.lang}
						lineCount={row.lineCount}
						previewChildren={
							<CodeBlock.Body
								code={previewCode}
								lang={row.lang}
								className={codeClassName}
							/>
						}
					>
						<CodeBlock.Body
							code={row.code}
							lang={row.lang}
							className={codeClassName}
						/>
					</ShameLeaderboardRow>
				);
			})}
		</div>
	);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/leaderboard-list.tsx
git commit -m "feat: add LeaderboardList server component with skeleton"
```

---

## Task 4: Replace static leaderboard page with SSR-backed version

**Files:**
- Modify: `src/app/leaderboard/page.tsx`

The page becomes `async`, prefetches both `getLeaderboard` and `getStats` in parallel, renders real stats in the header, and streams `LeaderboardList` inside a `Suspense`.

- [ ] **Step 1: Replace the full contents of `src/app/leaderboard/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	LeaderboardList,
	LeaderboardListSkeleton,
} from "@/components/leaderboard-list";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
	title: "shame_leaderboard — devroast",
	description:
		"The most roasted code on the internet. Ranked by shame, brutally honest.",
};

export default async function LeaderboardPage() {
	const queryClient = getQueryClient();

	const [, stats] = await Promise.all([
		queryClient.prefetchQuery(trpc.roasts.getLeaderboard.queryOptions()),
		queryClient.fetchQuery(trpc.roasts.getStats.queryOptions()),
	]);

	return (
		<main className="min-h-screen bg-bg-page">
			<div className="mx-auto max-w-[1280px] px-20 py-10">
				{/* ── Hero ────────────────────────────────────────────────────────── */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-3xl font-bold text-accent-green">
							{">"}
						</span>
						<h1 className="font-mono text-3xl font-bold text-text-primary">
							shame_leaderboard
						</h1>
					</div>
					<p className="font-mono text-sm text-text-secondary">
						{"// the most roasted code on the internet"}
					</p>
					<div className="flex items-center gap-2">
						<span className="font-mono text-[12px] text-text-tertiary">
							{stats.total.toLocaleString()} submissions
						</span>
						<span className="font-mono text-[12px] text-text-tertiary">·</span>
						<span className="font-mono text-[12px] text-text-tertiary">
							avg score: {stats.avgScore.toFixed(1)}/10
						</span>
					</div>
				</section>

				{/* ── Entries ─────────────────────────────────────────────────────── */}
				<section className="mt-10">
					<Suspense fallback={<LeaderboardListSkeleton />}>
						<LeaderboardList />
					</Suspense>
				</section>
			</div>
		</main>
	);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run check`
Expected: No errors.

- [ ] **Step 3: Open the leaderboard page in the browser**

Navigate to `http://localhost:3000/leaderboard`.
Expected:
- Header shows real submission count and avg score from DB
- 20 rows appear, ordered by score ascending (worst first)
- Each row has rank, score with color (red/amber/green), language, line count
- Rows with more than 3 lines show a "show more" button
- Clicking "show more" expands the full syntax-highlighted code
- Clicking "show less" collapses back to preview

- [ ] **Step 4: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat: wire leaderboard page to tRPC with SSR prefetch and real stats"
```
