CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('javascript', 'typescript', 'python', 'sql', 'go', 'rust', 'java', 'php', 'ruby', 'other');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('catastrophic', 'needs_serious_help', 'questionable', 'mediocre', 'acceptable');--> statement-breakpoint
CREATE TABLE "roast_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roastId" uuid NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"position" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "language" NOT NULL,
	"lineCount" integer NOT NULL,
	"roastMode" boolean DEFAULT false NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roastText" text NOT NULL,
	"suggestedFix" text,
	"onLeaderboard" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roast_issues" ADD CONSTRAINT "roast_issues_roastId_roasts_id_fk" FOREIGN KEY ("roastId") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roasts_leaderboard_idx" ON "roasts" USING btree ("onLeaderboard","score");