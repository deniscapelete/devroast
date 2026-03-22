import { cn } from "@/lib/cn";

type ScoreRingProps = {
	score: number;
	max?: number;
	size?: number;
	className?: string;
};

function ScoreRing({ score, max = 10, size = 120, className }: ScoreRingProps) {
	const strokeWidth = 4;
	const r = (size - strokeWidth) / 2;
	const cx = size / 2;
	const cy = size / 2;
	const circumference = 2 * Math.PI * r;
	const pct = Math.min(1, Math.max(0, score / max));
	const dashOffset = circumference * (1 - pct);
	const gradientId = `score-ring-grad-${size}-${String(score).replace(".", "_")}`;

	const formattedScore = Number.isInteger(score)
		? score.toString()
		: score.toFixed(1);

	// Font sizes scaled to ring size (Pencil: 48px score, 16px /10 in 180px ring)
	const scoreFontSize = Math.round(size * 0.267);
	const denomFontSize = Math.round(size * 0.089);

	return (
		<div
			className={cn("relative", className)}
			style={{ width: size, height: size }}
		>
			<svg
				width={size}
				height={size}
				className="-rotate-90"
				aria-hidden={true}
				role="presentation"
			>
				<defs>
					<linearGradient
						id={gradientId}
						x1="0"
						y1="0"
						x2="1"
						y2="1"
						gradientUnits="objectBoundingBox"
					>
						<stop
							offset="0%"
							style={{ stopColor: "var(--color-accent-green)" }}
						/>
						<stop
							offset="100%"
							style={{ stopColor: "var(--color-accent-amber)" }}
						/>
					</linearGradient>
				</defs>
				{/* Track */}
				<circle
					cx={cx}
					cy={cy}
					r={r}
					fill="none"
					strokeWidth={strokeWidth}
					className="stroke-border-primary"
				/>
				{/* Progress arc */}
				<circle
					cx={cx}
					cy={cy}
					r={r}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={`${circumference} ${circumference}`}
					strokeDashoffset={dashOffset}
					stroke={`url(#${gradientId})`}
				/>
			</svg>
			{/* Center text — horizontal, neutral colors */}
			<div className="absolute inset-0 flex items-center justify-center gap-0.5">
				<span
					className="font-mono font-bold leading-none text-text-primary"
					style={{ fontSize: scoreFontSize }}
				>
					{formattedScore}
				</span>
				<span
					className="font-mono leading-none text-text-tertiary"
					style={{ fontSize: denomFontSize }}
				>
					/10
				</span>
			</div>
		</div>
	);
}

export type { ScoreRingProps };
export { ScoreRing };
