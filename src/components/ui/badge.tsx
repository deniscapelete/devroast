import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const badge = tv({
	slots: {
		root: "inline-flex items-center gap-2",
		dot: "size-2 shrink-0 rounded-full",
		text: "font-mono text-[12px] leading-none",
	},
	variants: {
		variant: {
			critical: {
				dot: "bg-accent-red",
				text: "text-accent-red",
			},
			warning: {
				dot: "bg-accent-amber",
				text: "text-accent-amber",
			},
			good: {
				dot: "bg-accent-green",
				text: "text-accent-green",
			},
			info: {
				dot: "bg-accent-cyan",
				text: "text-accent-cyan",
			},
		},
	},
	defaultVariants: {
		variant: "good",
	},
});

type BadgeVariants = VariantProps<typeof badge>;

const variantLabels: Record<NonNullable<BadgeVariants["variant"]>, string> = {
	critical: "critical",
	warning: "warning",
	good: "good",
	info: "info",
};

type BadgeProps = {
	variant?: BadgeVariants["variant"];
	label?: string;
	className?: string;
};

function Badge({ variant = "good", label, className }: BadgeProps) {
	const { root, dot, text } = badge({ variant });
	return (
		<div className={cn(root(), className)}>
			<span className={dot()} />
			<span className={text()}>{label ?? variantLabels[variant]}</span>
		</div>
	);
}

export type { BadgeProps, BadgeVariants };
export { Badge, badge };
