import { asc, avg, count, eq } from "drizzle-orm";
import { roasts } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastsRouter = createTRPCRouter({
	getStats: baseProcedure.query(async ({ ctx }) => {
		const [result] = await ctx.db
			.select({
				total: count(),
				avgScore: avg(roasts.score),
			})
			.from(roasts);

		return {
			total: Number(result.total),
			avgScore: parseFloat(result.avgScore ?? "0"),
		};
	}),

	getShameLeaderboard: baseProcedure.query(async ({ ctx }) => {
		const [rows, [{ total }]] = await Promise.all([
			ctx.db
				.select({
					code: roasts.code,
					language: roasts.language,
					score: roasts.score,
					lineCount: roasts.lineCount,
				})
				.from(roasts)
				.where(eq(roasts.onLeaderboard, true))
				.orderBy(asc(roasts.score))
				.limit(3),
			ctx.db.select({ total: count() }).from(roasts),
		]);

		return {
			rows: rows.map((row, i) => ({
				rank: i + 1,
				score: parseFloat(row.score),
				codePreview: row.code.split("\n")[0],
				code: row.code,
				lineCount: row.lineCount,
				lang: row.language,
			})),
			total: Number(total),
		};
	}),

	getLeaderboard: baseProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select({
				code: roasts.code,
				language: roasts.language,
				score: roasts.score,
				lineCount: roasts.lineCount,
			})
			.from(roasts)
			.orderBy(asc(roasts.score))
			.limit(20);

		return rows.map((row, i) => ({
			rank: i + 1,
			score: parseFloat(row.score),
			lang: row.language,
			lineCount: row.lineCount,
			code: row.code,
		}));
	}),
});
