ALTER TABLE "advancedReport" DROP CONSTRAINT "advancedReport_appointmentId_appointments_id_fk";
--> statement-breakpoint
ALTER TABLE "advancedReport" ADD CONSTRAINT "advancedReport_appointmentId_appointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;