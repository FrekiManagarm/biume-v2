CREATE TYPE "public"."report_proposal_kind" AS ENUM('consultationReason', 'observation', 'anatomicalIssue', 'recommendation', 'note');--> statement-breakpoint
CREATE TYPE "public"."report_proposal_section" AS ENUM('clinical', 'anatomical', 'recommendations', 'notes');--> statement-breakpoint
CREATE TYPE "public"."report_proposal_state" AS ENUM('empty', 'proposed', 'needs_confirmation', 'confirmed', 'not_applicable');--> statement-breakpoint
CREATE TABLE "report_proposal" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"capture_id" uuid,
	"section" "report_proposal_section" NOT NULL,
	"kind" "report_proposal_kind" NOT NULL,
	"text" text NOT NULL,
	"state" "report_proposal_state" DEFAULT 'proposed' NOT NULL,
	"anchor_start" integer NOT NULL,
	"anchor_end" integer NOT NULL,
	"anchor_quote" text NOT NULL,
	"generation" integer DEFAULT 1 NOT NULL,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_proposal" ADD CONSTRAINT "report_proposal_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_proposal" ADD CONSTRAINT "report_proposal_capture_id_audio_capture_id_fk" FOREIGN KEY ("capture_id") REFERENCES "public"."audio_capture"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_proposal_report_idx" ON "report_proposal" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "report_proposal_state_idx" ON "report_proposal" USING btree ("report_id","state");