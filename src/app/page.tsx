import Link from "next/link";
import { RoastForm } from "@/components/roast-form";
import { StatsNumbers } from "@/components/stats-numbers";
import { button } from "@/components/ui/button";
import { TableRow } from "@/components/ui/table-row";
import { cn } from "@/lib/cn";

const LEADERBOARD_ROWS = [
	{
		rank: 1,
		score: 1.2,
		codePreview: 'eval(prompt("enter code")) · document.write(response)',
		lang: "javascript",
	},
	{
		rank: 2,
		score: 1.8,
		codePreview:
			"if (x == true) { return true; } else if (x == false) { return false; }",
		lang: "typescript",
	},
	{
		rank: 3,
		score: 2.1,
		codePreview: "SELECT * FROM users WHERE 1=1 -- TODO: add authentication",
		lang: "sql",
	},
] as const;

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

					{/* Table */}
					<div className="border border-border-primary">
						{/* Header row */}
						<div className="flex items-center gap-6 bg-bg-surface border-b border-border-primary px-5 h-10">
							<span className="w-10 shrink-0 font-mono text-[12px] font-bold text-text-tertiary">
								#
							</span>
							<span className="w-[60px] shrink-0 font-mono text-[12px] font-bold text-text-tertiary">
								score
							</span>
							<span className="flex-1 font-mono text-[12px] font-bold text-text-tertiary">
								code
							</span>
							<span className="w-[100px] shrink-0 font-mono text-[12px] font-bold text-text-tertiary">
								lang
							</span>
						</div>

						{/* Data rows */}
						{LEADERBOARD_ROWS.map((row) => (
							<TableRow
								key={row.rank}
								rank={row.rank}
								score={row.score}
								codePreview={row.codePreview}
								lang={row.lang}
							/>
						))}
					</div>

					{/* Footer hint */}
					<p className="font-mono text-[12px] text-text-tertiary text-center">
						showing top 3 of 2,847 ·{" "}
						<Link
							href="/leaderboard"
							className="hover:text-text-secondary transition-colors duration-150"
						>
							view full leaderboard {">>"}
						</Link>
					</p>
				</div>
			</section>

			{/* ── Bottom divider ────────────────────────────────────────────────── */}
			<div className="border-t border-border-primary mx-10" />
		</main>
	);
}
