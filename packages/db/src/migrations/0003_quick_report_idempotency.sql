ALTER TABLE "advancedReport" ADD COLUMN "client_request_id" text;--> statement-breakpoint
ALTER TABLE "advancedReport" ADD COLUMN "quick_request_fingerprint" text;--> statement-breakpoint
CREATE UNIQUE INDEX "advanced_report_quick_request_unique" ON "advancedReport" USING btree ("createdBy","client_request_id");