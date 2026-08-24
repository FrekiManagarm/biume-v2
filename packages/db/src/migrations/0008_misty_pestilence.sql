CREATE TYPE "public"."follow_up_alert_reason" AS ENUM('declared_worsening', 'reported_reaction', 'contact_requested');--> statement-breakpoint
CREATE TYPE "public"."follow_up_status" AS ENUM('scheduled', 'sent', 'answered', 'cancelled');--> statement-breakpoint
CREATE TABLE "follow_up" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"share_token" text,
	"status" "follow_up_status" DEFAULT 'scheduled' NOT NULL,
	"questionnaire" jsonb NOT NULL,
	"answer" jsonb,
	"due_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"answered_at" timestamp,
	"handled_at" timestamp,
	"last_error_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_alert" (
	"id" text PRIMARY KEY NOT NULL,
	"follow_up_id" text NOT NULL,
	"reason" "follow_up_alert_reason" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_access_challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"device_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"code_salt" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"session_secret" text NOT NULL,
	"device_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "owner_session_session_secret_unique" UNIQUE("session_secret")
);
--> statement-breakpoint
CREATE TABLE "report_share_link" (
	"token" text PRIMARY KEY NOT NULL,
	"shared_version_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_share_token_report_share_link_token_fk" FOREIGN KEY ("share_token") REFERENCES "public"."report_share_link"("token") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_alert" ADD CONSTRAINT "follow_up_alert_follow_up_id_follow_up_id_fk" FOREIGN KEY ("follow_up_id") REFERENCES "public"."follow_up"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_access_challenge" ADD CONSTRAINT "owner_access_challenge_token_report_share_link_token_fk" FOREIGN KEY ("token") REFERENCES "public"."report_share_link"("token") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_session" ADD CONSTRAINT "owner_session_token_report_share_link_token_fk" FOREIGN KEY ("token") REFERENCES "public"."report_share_link"("token") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_share_link" ADD CONSTRAINT "report_share_link_shared_version_id_report_shared_version_id_fk" FOREIGN KEY ("shared_version_id") REFERENCES "public"."report_shared_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_share_link" ADD CONSTRAINT "report_share_link_owner_id_clients_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follow_up_due_idx" ON "follow_up" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "follow_up_org_idx" ON "follow_up" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "follow_up_alert_followup_idx" ON "follow_up_alert" USING btree ("follow_up_id");--> statement-breakpoint
CREATE INDEX "owner_access_challenge_token_idx" ON "owner_access_challenge" USING btree ("token","device_id");--> statement-breakpoint
CREATE INDEX "owner_session_token_idx" ON "owner_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "report_share_link_owner_idx" ON "report_share_link" USING btree ("owner_id");