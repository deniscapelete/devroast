import Link from "next/link";
import { Suspense } from "react";
import { RoastForm } from "@/components/roast-form";
import {
	ShameLeaderboard,
	ShameLeaderboardSkeleton,
} from "@/components/shame-leaderboard";
import { StatsNumbers } from "@/components/stats-numbers";
import { button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default function HomePage() {
	return (
		<main className="bg-bg-page min-h-screen">
			{/* ── Hero ──────────────────────────────────────────────────────────── */}
			<section className="flex flex-col items-center px-10 pt-20 pb-8 gap-8">
				{/* Title */}
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="flex items-center gap-3">
						<span className="font-mono font-bold text-4xl leading-none text-accent-green">
							$
						</span>
						<h1 className="font-mono font-bold text-4xl leading-none text-text-primary">
							paste your code. get roasted.
						</h1>
					</div>
					<p className="font-mono text-sm text-text-secondary">
						{
							"// drop your code below and we'll rate it — brutally honest or full roast mode"
						}
					</p>
				</div>

				{/* Code editor + actions — client component */}
				<RoastForm />

				{/* Stats */}
				<StatsNumbers />
			</section>

			{/* ── Divider ───────────────────────────────────────────────────────── */}
			<div className="border-t border-border-primary mx-10 my-8" />

			{/* ── Leaderboard preview ───────────────────────────────────────────── */}
			<section className="pb-16 px-10">
				<div className="max-w-[960px] mx-auto flex flex-col gap-6">
					{/* Section header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-mono font-bold text-sm text-accent-green">
								{"//"}
							</span>
							<span className="font-mono font-bold text-sm text-text-primary">
								shame_leaderboard
							</span>
						</div>
						<Link
							href="/leaderboard"
							className={cn(button({ variant: "ghost", size: "sm" }))}
						>
							{"$ view_all >>"}
						</Link>
					</div>

					{/* Subtitle */}
					<p className="font-mono text-[13px] text-text-tertiary">
						{"// the worst code on the internet, ranked by shame"}
					</p>

					{/* Table + footer */}
					<Suspense fallback={<ShameLeaderboardSkeleton />}>
						<ShameLeaderboard />
					</Suspense>
				</div>
			</section>

			{/* ── Bottom divider ────────────────────────────────────────────────── */}
			<div className="border-t border-border-primary mx-10" />
		</main>
	);
}
