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
