import { cn } from "@/lib/cn";

type TableRowProps = {
	rank: number | string;
	score: number;
	codePreview: string;
	lang: string;
	className?: string;
};

function getScoreTextClass(score: number, max = 10): string {
	const pct = score / max;
	if (pct >= 0.7) return "text-accent-green";
	if (pct >= 0.4) return "text-accent-amber";
	return "text-accent-red";
}

function TableRow({
	rank,
	score,
	codePreview,
	lang,
	className,
}: TableRowProps) {
	const scoreColor = getScoreTextClass(score);

	return (
		<div
			className={cn(
				"flex items-center gap-6 border-b border-border-primary px-5 py-4",
				className,
			)}
		>
			<span className="w-10 shrink-0 font-mono text-[13px] text-text-tertiary">
				#{rank}
			</span>
			<span
				className={cn(
					"w-[60px] shrink-0 font-mono text-[13px] font-bold",
					scoreColor,
				)}
			>
				{score.toFixed(1)}
			</span>
			<span className="min-w-0 flex-1 truncate font-mono text-[12px] text-text-secondary">
				{codePreview}
			</span>
			<span className="w-[100px] shrink-0 font-mono text-[12px] text-text-tertiary">
				{lang}
			</span>
		</div>
	);
}

export type { TableRowProps };
export { TableRow };
