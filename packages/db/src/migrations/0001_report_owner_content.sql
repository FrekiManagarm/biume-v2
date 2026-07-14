CREATE TYPE "public"."report_owner_content_source_kind" AS ENUM('consultationReason', 'observation', 'anatomicalIssue', 'recommendation', 'notes');--> statement-breakpoint
CREATE TABLE "report_owner_content" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"source_kind" "report_owner_content_source_kind" NOT NULL,
	"source_id" text NOT NULL,
	"owner_text" text NOT NULL,
	"source_fingerprint" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_owner_content" ADD CONSTRAINT "report_owner_content_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_owner_content_source_unique" ON "report_owner_content" USING btree ("report_id","source_kind","source_id");