# Leaderboard Page — Design Spec

**Date:** 2026-03-29
**Status:** Approved

---

## Overview

Replace the static hardcoded leaderboard page with a fully dynamic implementation backed by tRPC and rendered via SSR. The page shows the 20 worst-scoring roasts (no `onLeaderboard` filter — raw `ORDER BY score ASC LIMIT 20`), using the same collapsible + Shiki syntax highlight UI pattern established in the homepage shame leaderboard. Stats (total submissions + avg score) also come from the database.

---

## Backend — tRPC (`src/trpc/routers/roasts.ts`)

### New procedure: `getLeaderboard`

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
});
```

- No filter — returns the 20 lowest scores from all roasts.
- Return shape matches what `ShameLeaderboardRow` already expects, no changes needed to that component.

### Fix existing procedure: `getStats`

Replace hardcoded values with real DB aggregation:

```ts
getStats: baseProcedure.query(async ({ ctx }) => {
  const [{ total, avgScore }] = await ctx.db
    .select({
      total: count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts);

  return {
    total: Number(total),
    avgScore: parseFloat(avgScore ?? "0"),
  };
});
```

- Benefits both leaderboard page and homepage `StatsNumbers` component (already wired to `getStats`) with no other changes.

---

## Frontend — New component: `LeaderboardList`

**File:** `src/components/leaderboard-list.tsx`
**Type:** Server component (async)

Responsibilities:
- Fetch data via `queryClient.fetchQuery(trpc.roasts.getLeaderboard.queryOptions())`
- For each row, compute `previewCode` (first 5 lines) and pass both `previewChildren` and `children` (full code) to `ShameLeaderboardRow`
- Both use `<CodeBlock.Body code={...} lang={...} className={codeClassName} />`
- `codeClassName` matches homepage: `"px-4 py-[14px] text-[12px] [&_pre]:leading-[18px] [&_code]:leading-[18px]"`

Also exports `LeaderboardListSkeleton` — renders 20 pulse-animated skeleton cards (same structure as `SkeletonCard` in `shame-leaderboard.tsx`).

---

## Frontend — Updated page: `src/app/leaderboard/page.tsx`

Replace static content with:

1. Two parallel SSR prefetches:
   - `await trpc.roasts.getLeaderboard.prefetch()`
   - `await trpc.roasts.getStats.prefetch()`

2. Wrap with `<HydrateClient>`.

3. Stats header (`LeaderboardStats` server component, inline or extracted):
   - Fetches `getStats` and renders `{total.toLocaleString()} submissions · avg score: {avgScore.toFixed(1)}/10`

4. Entries section:
   - `<Suspense fallback={<LeaderboardListSkeleton />}>`
   - `<LeaderboardList />`

---

## Files Changed

| File | Action |
|---|---|
| `src/trpc/routers/roasts.ts` | Add `getLeaderboard`; fix `getStats` with real DB query |
| `src/components/leaderboard-list.tsx` | Create — server component + skeleton |
| `src/app/leaderboard/page.tsx` | Replace static with SSR prefetch + dynamic components |

## Files NOT Changed

- `src/components/shame-leaderboard-row.tsx` — reused as-is
- `src/components/ui/code-block.tsx` — reused as-is
- `src/components/shame-leaderboard.tsx` — reused as-is
- `src/components/stats-numbers.tsx` — benefits automatically from `getStats` fix

---

## Non-Goals

- Pagination (not needed — fixed 20 results)
- Filtering or sorting controls
- Link from leaderboard row to roast detail page
