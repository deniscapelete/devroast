import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/code-block";

export const metadata: Metadata = {
	title: "shame_leaderboard — devroast",
	description:
		"The most roasted code on the internet. Ranked by shame, brutally honest.",
};

type Entry = {
	rank: number;
	score: number;
	lang: string;
	lines: number;
	code: string;
};

const ENTRIES: Entry[] = [
	{
		rank: 1,
		score: 1.2,
		lang: "javascript",
		lines: 3,
		code: 'eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol',
	},
	{
		rank: 2,
		score: 1.8,
		lang: "typescript",
		lines: 3,
		code: "if (x == true) { return true; }\nelse if (x == false) { return false; }\nelse { return !false; }",
	},
	{
		rank: 3,
		score: 2.1,
		lang: "sql",
		lines: 2,
		code: "SELECT * FROM users WHERE 1=1\n-- TODO: add authentication",
	},
	{
		rank: 4,
		score: 2.3,
		lang: "java",
		lines: 3,
		code: "catch (e) {\n  // ignore\n}",
	},
	{
		rank: 5,
		score: 2.5,
		lang: "javascript",
		lines: 3,
		code: "const sleep = (ms) =>\n  new Date(Date.now() + ms)\n  while(new Date() < end) {}",
	},
];

async function EntryCard({ entry }: { entry: Entry }) {
	return (
		<article className="border border-border-primary">
			{/* Meta row */}
			<div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[13px] text-text-tertiary">#</span>
						<span className="font-mono text-[13px] font-bold text-accent-amber">
							{entry.rank}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[12px] text-text-tertiary">
							score:
						</span>
						<span className="font-mono text-[13px] font-bold text-accent-red">
							{entry.score.toFixed(1)}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="font-mono text-[12px] text-text-secondary">
						{entry.lang}
					</span>
					<span className="font-mono text-[12px] text-text-tertiary">
						{entry.lines} lines
					</span>
				</div>
			</div>

			{/* Code block */}
			<div className="flex h-[120px] overflow-hidden bg-bg-input">
				{/* Line numbers */}
				<div className="flex w-10 shrink-0 flex-col items-end gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 pt-[14px]">
					{Array.from({ length: entry.lines }, (_, i) => {
						const lineNumber = i + 1;
						return (
							<span
								key={`line-${lineNumber}`}
								className="font-mono text-[12px] leading-[18px] text-text-tertiary"
							>
								{lineNumber}
							</span>
						);
					})}
				</div>

				{/* Syntax-highlighted code */}
				<CodeBlock.Body
					code={entry.code}
					lang={entry.lang}
					className="px-4 py-[14px] text-[12px]"
				/>
			</div>
		</article>
	);
}

export default function LeaderboardPage() {
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
							2,847 submissions
						</span>
						<span className="font-mono text-[12px] text-text-tertiary">·</span>
						<span className="font-mono text-[12px] text-text-tertiary">
							avg score: 4.2/10
						</span>
					</div>
				</section>

				{/* ── Entries ──────────────────────────────────────────────────────── */}
				<section className="mt-10 flex flex-col gap-5">
					{ENTRIES.map((entry) => (
						<EntryCard key={entry.rank} entry={entry} />
					))}
				</section>
			</div>
		</main>
	);
}
