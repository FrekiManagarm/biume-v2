CREATE TYPE "public"."audio_capture_status" AS ENUM('pending_upload', 'uploading', 'uploaded', 'retryable_failure', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "audio_capture" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"practitioner_id" text NOT NULL,
	"appointment_id" text,
	"patient_id" text,
	"report_id" text,
	"duration_ms" integer NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"sha256" text NOT NULL,
	"object_key" text NOT NULL,
	"object_etag" text,
	"status" "audio_capture_status" DEFAULT 'pending_upload' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error_code" text,
	"created_at" timestamp NOT NULL,
	"uploaded_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"purged_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "audio_capture_duration_range" CHECK ("audio_capture"."duration_ms" > 0 and "audio_capture"."duration_ms" <= 600000),
	CONSTRAINT "audio_capture_byte_size_range" CHECK ("audio_capture"."byte_size" > 0 and "audio_capture"."byte_size" <= 16777216),
	CONSTRAINT "audio_capture_sha256_shape" CHECK ("audio_capture"."sha256" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "audio_capture_mime_type" CHECK ("audio_capture"."mime_type" = 'audio/mp4'),
	CONSTRAINT "audio_capture_attempt_count_non_negative" CHECK ("audio_capture"."attempt_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "audio_capture" ADD CONSTRAINT "audio_capture_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_capture" ADD CONSTRAINT "audio_capture_practitioner_id_users_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_capture" ADD CONSTRAINT "audio_capture_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_capture" ADD CONSTRAINT "audio_capture_patient_id_pets_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_capture" ADD CONSTRAINT "audio_capture_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_capture_object_key_unique" ON "audio_capture" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "audio_capture_org_created_idx" ON "audio_capture" USING btree ("organization_id","created_at","id");--> statement-breakpoint
CREATE INDEX "audio_capture_status_expires_idx" ON "audio_capture" USING btree ("status","expires_at");