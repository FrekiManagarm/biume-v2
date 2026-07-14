CREATE TYPE "public"."notificationType" AS ENUM('rate', 'newClient', 'newReport', 'newAskReservation');--> statement-breakpoint
CREATE TYPE "public"."petGender" AS ENUM('Male', 'Female');--> statement-breakpoint
CREATE TYPE "public"."reminderStatus" AS ENUM('pending', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reminderType" AS ENUM('appointment', 'followup', 'vaccination', 'medication', 'other');--> statement-breakpoint
CREATE TYPE "public"."anatomical_issue_observation_type" AS ENUM('dynamic', 'static', 'diagnosticExclusion', 'none');--> statement-breakpoint
CREATE TYPE "public"."anatomical_issue_type" AS ENUM('dysfunction', 'anatomicalSuspicion', 'observation');--> statement-breakpoint
CREATE TYPE "public"."laterality_type" AS ENUM('left', 'right', 'bilateral');--> statement-breakpoint
CREATE TYPE "public"."reportStatus" AS ENUM('draft', 'finalized', 'sent');--> statement-breakpoint
CREATE TYPE "public"."animal_type" AS ENUM('DOG', 'CAT', 'HORSE');--> statement-breakpoint
CREATE TYPE "public"."dysfunction_zone" AS ENUM('articulation', 'fascias', 'organes', 'muscles', 'other');--> statement-breakpoint
CREATE TYPE "public"."appointmentStatus" AS ENUM('CREATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"notificationType" text NOT NULL,
	"message" text NOT NULL,
	"userId" text,
	"new" boolean DEFAULT true,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"metadata" text,
	"customerStripeId" text,
	"on_boarding_complete" boolean DEFAULT false NOT NULL,
	"on_boarding_explications" boolean DEFAULT false NOT NULL,
	"ai" boolean DEFAULT false NOT NULL,
	"email" text,
	"locked" boolean DEFAULT false NOT NULL,
	"lang" text DEFAULT 'fr' NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"weight" integer NOT NULL,
	"height" integer NOT NULL,
	"description" text,
	"ownerId" text,
	"breed" text NOT NULL,
	"image" text,
	"chippedNumber" integer,
	"gender" "petGender" DEFAULT 'Male' NOT NULL,
	"nacType" text,
	"birthDate" timestamp NOT NULL,
	"deseases" text[],
	"allergies" text[],
	"intolerences" text[],
	"organizationId" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "reminder" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "reminderType" DEFAULT 'other',
	"status" "reminderStatus" DEFAULT 'pending',
	"dueDate" timestamp NOT NULL,
	"organizationId" text,
	"userId" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"userId" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"signature" text NOT NULL,
	"organizationId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "twoFactors" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"two_factor_enabled" boolean,
	"lang" text DEFAULT 'fr',
	"phone_number" text,
	"email_notifications" boolean DEFAULT false NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anatomical_issue" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "anatomical_issue_type" DEFAULT 'dysfunction' NOT NULL,
	"observation_type" "anatomical_issue_observation_type" DEFAULT 'none',
	"anatomical_part_id" text NOT NULL,
	"advanced_report_id" text NOT NULL,
	"notes" text DEFAULT '',
	"laterality" "laterality_type" DEFAULT 'bilateral' NOT NULL,
	"severity" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "advancedReport" (
	"id" text PRIMARY KEY NOT NULL,
	"createdBy" text,
	"title" text NOT NULL,
	"consultationReason" text DEFAULT '' NOT NULL,
	"patientId" text,
	"appointmentId" text,
	"notes" text DEFAULT '',
	"status" "reportStatus" DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "advanced_report_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"advanced_report_id" text,
	"recommendation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "anatomical_part" (
	"id" text PRIMARY KEY NOT NULL,
	"zone" "dysfunction_zone" NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"viewboxLeft" text DEFAULT '' NOT NULL,
	"pathLeft" text DEFAULT '' NOT NULL,
	"transformLeft" text DEFAULT '' NOT NULL,
	"viewboxRight" text DEFAULT '' NOT NULL,
	"pathRight" text DEFAULT '' NOT NULL,
	"transformRight" text DEFAULT '' NOT NULL,
	"animal_type" "animal_type" DEFAULT 'DOG' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "anatomical_part_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"precision" boolean DEFAULT false NOT NULL,
	"anatomical_part_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "animals" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"code" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text,
	"organizationId" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "client_note" (
	"id" text,
	"organization_id" text,
	"client_id" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"patientId" text,
	"beginAt" timestamp NOT NULL,
	"endAt" timestamp NOT NULL,
	"organizationId" text,
	"atHome" boolean DEFAULT false NOT NULL,
	"status" "appointmentStatus" DEFAULT 'CREATED' NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "medical_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"petId" text NOT NULL,
	"uploadedBy" text NOT NULL,
	"fileName" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" text NOT NULL,
	"fileSize" text,
	"title" text,
	"description" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_type_animals_id_fk" FOREIGN KEY ("type") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_ownerId_clients_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder" ADD CONSTRAINT "reminder_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder" ADD CONSTRAINT "reminder_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twoFactors" ADD CONSTRAINT "twoFactors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatomical_issue" ADD CONSTRAINT "anatomical_issue_anatomical_part_id_anatomical_part_id_fk" FOREIGN KEY ("anatomical_part_id") REFERENCES "public"."anatomical_part"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatomical_issue" ADD CONSTRAINT "anatomical_issue_advanced_report_id_advancedReport_id_fk" FOREIGN KEY ("advanced_report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advancedReport" ADD CONSTRAINT "advancedReport_createdBy_organizations_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advancedReport" ADD CONSTRAINT "advancedReport_patientId_pets_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advancedReport" ADD CONSTRAINT "advancedReport_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_report_recommendations" ADD CONSTRAINT "advanced_report_recommendations_advanced_report_id_advancedReport_id_fk" FOREIGN KEY ("advanced_report_id") REFERENCES "public"."advancedReport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anatomical_part_type" ADD CONSTRAINT "anatomical_part_type_anatomical_part_id_anatomical_part_id_fk" FOREIGN KEY ("anatomical_part_id") REFERENCES "public"."anatomical_part"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_pets_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_petId_pets_id_fk" FOREIGN KEY ("petId") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_uploadedBy_organizations_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;