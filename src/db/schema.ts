import {
	boolean,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	smallint,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const languageEnum = pgEnum("language", [
	"javascript",
	"typescript",
	"python",
	"sql",
	"go",
	"rust",
	"java",
	"php",
	"ruby",
	"other",
]);

export const verdictEnum = pgEnum("verdict", [
	"catastrophic", // 0.0 – 1.9
	"needs_serious_help", // 2.0 – 3.9
	"questionable", // 4.0 – 5.9
	"mediocre", // 6.0 – 7.9
	"acceptable", // 8.0 – 10.0
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical", // accent-red
	"warning", // accent-amber
	"good", // accent-green
]);

// ─── Tabelas ──────────────────────────────────────────────────────────────────

export const roasts = pgTable(
	"roasts",
	{
		id: uuid().primaryKey().defaultRandom(),
		code: text().notNull(),
		language: languageEnum().notNull(),
		lineCount: integer().notNull(),
		roastMode: boolean().notNull().default(false),
		score: numeric({ precision: 3, scale: 1 }).notNull(),
		verdict: verdictEnum().notNull(),
		roastText: text().notNull(),
		suggestedFix: text(),
		onLeaderboard: boolean().notNull().default(false),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("roasts_leaderboard_idx").on(table.onLeaderboard, table.score),
	],
);

export const roastIssues = pgTable("roast_issues", {
	id: uuid().primaryKey().defaultRandom(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	severity: issueSeverityEnum().notNull(),
	title: varchar({ length: 120 }).notNull(),
	description: text().notNull(),
	position: smallint().notNull(),
});

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type Roast = typeof roasts.$inferSelect;
export type NewRoast = typeof roasts.$inferInsert;
export type RoastIssue = typeof roastIssues.$inferSelect;
export type NewRoastIssue = typeof roastIssues.$inferInsert;
