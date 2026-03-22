import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const button = tv({
	base: [
		"inline-flex items-center justify-center gap-2",
		"text-[13px] leading-none",
		"cursor-pointer select-none",
		"transition-colors duration-150",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
		"disabled:pointer-events-none disabled:opacity-40",
	],
	variants: {
		variant: {
			// $ roast_my_code — fundo verde, texto escuro
			primary:
				"bg-accent-green text-bg-page font-medium hover:bg-accent-green-hover focus-visible:ring-accent-green",
			// $ share_roast — sem fundo, borda sutil, texto claro
			secondary:
				"bg-transparent text-text-primary font-normal text-[12px] border border-border-primary hover:bg-bg-elevated focus-visible:ring-border-primary",
			// $ view_all >> — sem fundo, borda sutil, texto muted
			ghost:
				"bg-transparent text-text-secondary font-normal text-[12px] border border-border-primary hover:bg-bg-elevated hover:text-text-primary focus-visible:ring-border-primary",
			// ação destrutiva
			destructive:
				"bg-destructive text-bg-page font-medium hover:bg-destructive-hover focus-visible:ring-destructive",
		},
		size: {
			sm: "px-3 py-1.5",
			md: "px-6 py-[10px]",
			lg: "px-8 py-3 text-[14px]",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

function Button({ variant, size, className, ...props }: ButtonProps) {
	return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export type { ButtonProps, ButtonVariants };
export { Button, button };
