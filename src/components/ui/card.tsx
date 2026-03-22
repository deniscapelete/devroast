import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { cn } from "@/lib/cn";

const card = tv({
	base: "flex flex-col gap-3 border border-border-primary p-5",
});

// ── Sub-components ────────────────────────────────────────────────────────────

function CardRoot({ className, children, ...props }: ComponentProps<"div">) {
	return (
		<div className={cn(card(), className)} {...props}>
			{children}
		</div>
	);
}

function CardTitle({ className, children, ...props }: ComponentProps<"p">) {
	return (
		<p
			className={cn(
				"font-mono text-[13px] font-medium leading-none text-text-primary",
				className,
			)}
			{...props}
		>
			{children}
		</p>
	);
}

function CardDescription({
	className,
	children,
	...props
}: ComponentProps<"p">) {
	return (
		<p
			className={cn(
				"font-mono text-[12px] leading-normal text-text-secondary",
				className,
			)}
			{...props}
		>
			{children}
		</p>
	);
}

// ── Namespace export ──────────────────────────────────────────────────────────

const Card = {
	Root: CardRoot,
	Title: CardTitle,
	Description: CardDescription,
};

export { Card, card };
