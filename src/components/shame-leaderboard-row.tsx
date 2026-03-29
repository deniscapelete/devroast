"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/cn";

function getScoreTextClass(score: number): string {
	const pct = score / 10;
	if (pct >= 0.7) return "text-accent-green";
	if (pct >= 0.4) return "text-accent-amber";
	return "text-accent-red";
}

type ShameLeaderboardRowProps = {
	rank: number;
	score: number;
	lang: string;
	lineCount: number;
	previewChildren: ReactNode;
	children: ReactNode;
};

export function ShameLeaderboardRow({
	rank,
	score,
	lang,
	lineCount,
	previewChildren,
	children,
}: ShameLeaderboardRowProps) {
	const [expanded, setExpanded] = useState(false);
	const scoreColor = getScoreTextClass(score);
	const hasMore = lineCount > 3;
	const previewLineCount = Math.min(lineCount, 5);
	const visibleLineCount = expanded ? lineCount : previewLineCount;

	// 14px top-padding + 3 lines × 18px = 68px → fade starts right after line 3
	const codeSectionStyle =
		hasMore && !expanded
			? {
					maskImage:
						"linear-gradient(to bottom, black 68px, transparent 104px)",
				}
			: undefined;

	return (
		<div className="border border-border-primary">
			{/* Card header */}
			<div className="flex items-center gap-4 border-b border-border-primary bg-bg-surface px-5 py-3">
				<span className="font-mono text-[13px] text-text-tertiary">
					#{rank}
				</span>
				<span className="font-mono text-[13px]">
					<span className="text-text-tertiary">score: </span>
					<span className={cn("font-bold", scoreColor)}>
						{score.toFixed(1)}
					</span>
				</span>
				<span className="flex-1" />
				<span className="font-mono text-[12px] text-text-tertiary">
					{lang}
					<span className="mx-1.5 text-text-tertiary opacity-40">·</span>
					{lineCount} {lineCount === 1 ? "line" : "lines"}
				</span>
			</div>

			{/* Code section — always visible, mask fades lines 4-5 when collapsed */}
			<div className="flex bg-bg-input" style={codeSectionStyle}>
				{/* Line numbers — no gap, leading matches code line-height */}
				<div className="flex w-10 shrink-0 flex-col items-end border-r border-border-primary bg-bg-surface px-2.5 pb-[14px] pt-[14px]">
					{Array.from({ length: visibleLineCount }, (_, i) => {
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

				{/* Highlighted code */}
				<div className="min-w-0 flex-1 overflow-x-auto">
					{expanded ? children : previewChildren}
				</div>
			</div>

			{/* Show more / show less — centered */}
			{hasMore && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-border-primary bg-bg-surface py-2 font-mono text-[12px] text-text-tertiary transition-colors duration-150 hover:text-text-secondary"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
						className={cn(
							"shrink-0 transition-transform duration-200",
							expanded && "rotate-180",
						)}
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
					{expanded
						? "show less"
						: `show more — ${lineCount - 3} more ${lineCount - 3 === 1 ? "line" : "lines"}`}
				</button>
			)}
		</div>
	);
}
