import { CodeBlock } from "@/components/ui/code-block";
import { getQueryClient, trpc } from "@/trpc/server";
import { ShameLeaderboardRow } from "./shame-leaderboard-row";

function SkeletonCard() {
	return (
		<div className="animate-pulse border border-border-primary">
			<div className="flex items-center gap-4 border-b border-border-primary bg-bg-surface px-5 py-3">
				<span className="block h-3 w-6 rounded-sm bg-bg-elevated" />
				<span className="block h-3 w-20 rounded-sm bg-bg-elevated" />
				<span className="flex-1" />
				<span className="block h-3 w-24 rounded-sm bg-bg-elevated" />
			</div>
			<div className="flex bg-bg-input">
				<div className="flex w-10 shrink-0 flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-[14px]">
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-4 rounded-sm bg-bg-elevated" />
				</div>
				<div className="flex-1 space-y-1.5 px-4 py-[14px]">
					<span className="block h-2 w-3/4 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-1/2 rounded-sm bg-bg-elevated" />
					<span className="block h-2 w-2/3 rounded-sm bg-bg-elevated" />
				</div>
			</div>
		</div>
	);
}

export function LeaderboardListSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{Array.from({ length: 20 }, (_, _i) => (
				<SkeletonCard key={crypto.randomUUID()} />
			))}
		</div>
	);
}

export async function LeaderboardList() {
	const queryClient = getQueryClient();
	const data = await queryClient.fetchQuery(
		trpc.roasts.getLeaderboard.queryOptions(),
	);

	const codeClassName =
		"px-4 py-[14px] text-[12px] [&_pre]:leading-[18px] [&_code]:leading-[18px]";

	return (
		<div className="flex flex-col gap-3">
			{data.map((row) => {
				const previewCode = row.code.split("\n").slice(0, 5).join("\n");
				return (
					<ShameLeaderboardRow
						key={row.rank}
						rank={row.rank}
						score={row.score}
						lang={row.lang}
						lineCount={row.lineCount}
						previewChildren={
							<CodeBlock.Body
								code={previewCode}
								lang={row.lang}
								className={codeClassName}
							/>
						}
					>
						<CodeBlock.Body
							code={row.code}
							lang={row.lang}
							className={codeClassName}
						/>
					</ShameLeaderboardRow>
				);
			})}
		</div>
	);
}
