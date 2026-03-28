"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function StatsNumbers() {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.roasts.getStats.queryOptions());

	return (
		<div className="flex items-center gap-6">
			<span className="font-mono text-[12px] text-text-tertiary">
				<NumberFlow value={data?.total ?? 0} /> codes roasted
			</span>
			<span className="font-mono text-[12px] text-text-tertiary">·</span>
			<span className="font-mono text-[12px] text-text-tertiary">
				avg score:{" "}
				<NumberFlow
					value={data?.avgScore ?? 0}
					format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
				/>
				/10
			</span>
		</div>
	);
}
