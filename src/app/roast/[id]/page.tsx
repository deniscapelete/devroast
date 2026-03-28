import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

// ── Static roast data ─────────────────────────────────────────────────────────

const ROAST = {
	score: 3.5,
	verdict: "needs_serious_help" as const,
	quote:
		'"this code looks like it was written during a power outage... in 2005."',
	lang: "javascript",
	lines: 7,
	code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied")
    total = total * 0.9
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
	issues: [
		{
			variant: "critical" as const,
			title: "using var instead of const/let",
			description:
				"var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
		},
		{
			variant: "warning" as const,
			title: "imperative loop pattern",
			description:
				"for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
		},
		{
			variant: "good" as const,
			title: "clear naming conventions",
			description:
				"calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
		},
		{
			variant: "good" as const,
			title: "single responsibility",
			description:
				"the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
		},
	],
	diff: {
		filename: "your_code.ts → improved_code.ts",
		lines: [
			{ type: "context" as const, content: "function calculateTotal(items) {" },
			{ type: "removed" as const, content: "  var total = 0;" },
			{
				type: "removed" as const,
				content: "  for (var i = 0; i < items.length; i++) {",
			},
			{
				type: "removed" as const,
				content: "    total = total + items[i].price;",
			},
			{ type: "removed" as const, content: "  }" },
			{ type: "removed" as const, content: "  return total;" },
			{
				type: "added" as const,
				content: "  return items.reduce((sum, item) => sum + item.price, 0);",
			},
			{ type: "context" as const, content: "}" },
		],
	},
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export function generateMetadata({
	params,
}: {
	params: { id: string };
}): Metadata {
	return {
		title: `roast/${params.id} — devroast`,
		description: ROAST.quote,
	};
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RoastPage() {
	return (
		<main className="min-h-screen bg-bg-page">
			<div className="mx-auto max-w-[1280px] px-20 py-10 flex flex-col gap-10">
				{/* ── Score Hero ──────────────────────────────────────────────────── */}
				<section className="flex items-center gap-12">
					<ScoreRing score={ROAST.score} size={180} />

					<div className="flex flex-col gap-4">
						{/* Verdict badge */}
						<Badge
							variant={
								ROAST.verdict === "needs_serious_help" ? "critical" : "good"
							}
							label={`verdict: ${ROAST.verdict}`}
						/>

						{/* Roast quote */}
						<p className="font-mono text-xl leading-relaxed text-text-primary">
							{ROAST.quote}
						</p>

						{/* Meta */}
						<div className="flex items-center gap-4">
							<span className="font-mono text-[12px] text-text-tertiary">
								lang: {ROAST.lang}
							</span>
							<span className="font-mono text-[12px] text-text-tertiary">
								·
							</span>
							<span className="font-mono text-[12px] text-text-tertiary">
								{ROAST.lines} lines
							</span>
						</div>

						{/* Share */}
						<div className="flex items-center">
							<button
								type="button"
								className="flex items-center border border-border-primary px-4 py-2 font-mono text-[12px] text-text-primary transition-colors duration-150 hover:border-border-secondary"
							>
								$ share_roast
							</button>
						</div>
					</div>
				</section>

				<hr className="border-t border-border-primary" />

				{/* ── Submitted Code ──────────────────────────────────────────────── */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">
							{"//"}
						</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">
							your_submission
						</h2>
					</div>

					<div className="flex overflow-hidden border border-border-primary bg-bg-input">
						{/* Line numbers */}
						<div className="flex w-12 shrink-0 flex-col items-end gap-2 border-r border-border-primary bg-bg-surface px-3 pt-4 pb-4">
							{ROAST.code.split("\n").map((_, i) => {
								const lineNum = i + 1;
								return (
									<span
										key={`ln-${lineNum}`}
										className="font-mono text-[12px] leading-[20px] text-text-tertiary"
									>
										{lineNum}
									</span>
								);
							})}
						</div>

						{/* Code with syntax highlighting */}
						<CodeBlock.Body
							code={ROAST.code}
							lang={ROAST.lang}
							className="px-4 pt-4 pb-4 text-[12px]"
						/>
					</div>
				</section>

				<hr className="border-t border-border-primary" />

				{/* ── Detailed Analysis ───────────────────────────────────────────── */}
				<section className="flex flex-col gap-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">
							{"//"}
						</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">
							detailed_analysis
						</h2>
					</div>

					{/* 2×2 grid */}
					<div className="flex flex-col gap-5">
						<div className="flex gap-5">
							{ROAST.issues.slice(0, 2).map((issue) => (
								<Card.Root key={issue.title} className="flex-1">
									<Badge variant={issue.variant} />
									<Card.Title>{issue.title}</Card.Title>
									<Card.Description>{issue.description}</Card.Description>
								</Card.Root>
							))}
						</div>
						<div className="flex gap-5">
							{ROAST.issues.slice(2, 4).map((issue) => (
								<Card.Root key={issue.title} className="flex-1">
									<Badge variant={issue.variant} />
									<Card.Title>{issue.title}</Card.Title>
									<Card.Description>{issue.description}</Card.Description>
								</Card.Root>
							))}
						</div>
					</div>
				</section>

				<hr className="border-t border-border-primary" />

				{/* ── Suggested Fix (Diff) ────────────────────────────────────────── */}
				<section className="flex flex-col gap-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">
							{"//"}
						</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">
							suggested_fix
						</h2>
					</div>

					<div className="border border-border-primary bg-bg-input">
						{/* Diff header */}
						<div className="flex h-10 items-center border-b border-border-primary px-4">
							<span className="font-mono text-[12px] font-medium text-text-secondary">
								{ROAST.diff.filename}
							</span>
						</div>

						{/* Diff lines */}
						<div className="py-1">
							{ROAST.diff.lines.map((line) => (
								<DiffLine
									key={`${line.type}-${line.content}`}
									type={line.type}
									content={line.content}
								/>
							))}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
