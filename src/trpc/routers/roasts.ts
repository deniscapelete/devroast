import { baseProcedure, createTRPCRouter } from "../init";

export const roastsRouter = createTRPCRouter({
	getStats: baseProcedure.query(async () => {
		// TODO: replace with real DB query when database is connected
		return {
			total: 2847,
			avgScore: 4.2,
		};
	}),
});
