"use client";

import { Switch } from "@base-ui-components/react/switch";
import { tv } from "tailwind-variants";
import { cn } from "@/lib/cn";

const toggle = tv({
	slots: {
		wrapper: "inline-flex items-center gap-3",
		track: [
			"relative flex items-center h-[22px] w-10 shrink-0 cursor-pointer rounded-full px-[3px]",
			"transition-colors duration-150",
			"bg-border-primary data-[checked]:bg-accent-green",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green",
			"focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
		],
		thumb: [
			"block size-4 rounded-full",
			"bg-text-secondary data-[checked]:bg-black",
			"transition-transform duration-150",
			"translate-x-0 data-[checked]:translate-x-[18px]",
		],
		label: "font-mono text-[12px] leading-none text-text-secondary",
	},
});

type ToggleProps = {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	label?: string;
	className?: string;
};

function Toggle({
	checked,
	defaultChecked,
	onCheckedChange,
	label,
	className,
}: ToggleProps) {
	const { wrapper, track, thumb, label: labelCls } = toggle();

	return (
		<div className={cn(wrapper(), className)}>
			<Switch.Root
				checked={checked}
				defaultChecked={defaultChecked}
				onCheckedChange={onCheckedChange}
				className={track()}
			>
				<Switch.Thumb className={thumb()} />
			</Switch.Root>
			{label && <span className={labelCls()}>{label}</span>}
		</div>
	);
}

export type { ToggleProps };
export { Toggle, toggle };
