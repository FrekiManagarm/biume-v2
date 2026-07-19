CREATE TYPE "public"."report_section" AS ENUM('clinical', 'anatomical', 'recommendations', 'notes');--> statement-breakpoint
CREATE TYPE "public"."report_section_state" AS ENUM('empty', 'proposed', 'needs_confirmation', 'confirmed', 'not_applicable');--> statement-breakpoint
CREATE TABLE "report_section_state" (
	"report_id" text NOT NULL,
	"section" "report_section" NOT NULL,
	"state" "report_section_state" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_section_state_report_id_section_pk" PRIMARY KEY("report_id","section")
);
--> statement-breakpoint
CREATE TABLE "report_shared_version" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"report_revision" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "weight" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "height" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "breed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "gender" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "gender" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "birthDate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "advancedReport" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "report_section_state" ADD CONSTRAINT "report_section_state_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_shared_version" ADD CONSTRAINT "report_shared_version_report_id_advancedReport_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_shared_version" ADD CONSTRAINT "report_shared_version_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_shared_version_revision_unique" ON "report_shared_version" USING btree ("report_id","report_revision");--> statement-breakpoint
INSERT INTO "report_section_state" ("report_id", "section", "state")
SELECT
  report."id",
  section.value::"report_section",
  'empty'::"report_section_state"
FROM "advancedReport" AS report
CROSS JOIN (
  VALUES ('clinical'), ('anatomical'), ('recommendations'), ('notes')
) AS section(value)
ON CONFLICT DO NOTHING;
