import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const diffLine = tv({
	slots: {
		root: "flex items-baseline gap-2 px-4 py-2 font-mono text-[13px] leading-relaxed",
		prefix: "w-3 shrink-0 select-none",
		code: "text-text-secondary",
	},
	variants: {
		type: {
			removed: {
				root: "bg-diff-removed-bg",
				prefix: "text-accent-red",
			},
			added: {
				root: "bg-diff-added-bg",
				prefix: "text-accent-green",
			},
			context: {
				root: "bg-transparent",
				prefix: "text-transparent",
			},
		},
	},
	defaultVariants: {
		type: "context",
	},
});

type DiffLineVariants = VariantProps<typeof diffLine>;

type DiffLineProps = {
	type?: DiffLineVariants["type"];
	content: string;
	className?: string;
};

const prefixChar: Record<NonNullable<DiffLineVariants["type"]>, string> = {
	removed: "-",
	added: "+",
	context: " ",
};

function DiffLine({ type = "context", content, className }: DiffLineProps) {
	const { root, prefix, code } = diffLine({ type });
	return (
		<div className={cn(root(), className)}>
			<span className={prefix()} aria-hidden>
				{prefixChar[type]}
			</span>
			<span className={code()}>{content}</span>
		</div>
	);
}

export type { DiffLineProps, DiffLineVariants };
export { DiffLine, diffLine };
