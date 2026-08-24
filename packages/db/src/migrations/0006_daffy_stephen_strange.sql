CREATE TYPE "public"."capture_transcript_status" AS ENUM('pending', 'running', 'ready', 'corrected', 'inaudible', 'failed');--> statement-breakpoint
CREATE TABLE "capture_transcript" (
	"capture_id" uuid PRIMARY KEY NOT NULL,
	"status" "capture_transcript_status" DEFAULT 'pending' NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"provider" text DEFAULT '' NOT NULL,
	"last_error_code" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"corrected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capture_transcript_text_length" CHECK (char_length("capture_transcript"."text") <= 20000)
);
--> statement-breakpoint
ALTER TABLE "capture_transcript" ADD CONSTRAINT "capture_transcript_capture_id_audio_capture_id_fk" FOREIGN KEY ("capture_id") REFERENCES "public"."audio_capture"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "capture_transcript_status_idx" ON "capture_transcript" USING btree ("status");