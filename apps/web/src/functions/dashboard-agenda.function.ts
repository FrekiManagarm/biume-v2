import { and, eq, gte, lte } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "@biume/db";
import { appointments } from "@biume/db/schema/index";
import { getCurrentOrganization } from "#/functions/auth.function";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";

const dashboardAgendaDaySchema = z.object({
  date: z.string().date(),
});

export type DashboardAgendaDayResult = {
  selectedDate: string;
  appointments: AgendaAppointmentInput[];
};

export const getDashboardAgendaDay = createServerFn({ method: "GET" })
  .validator(dashboardAgendaDaySchema)
  .handler(async ({ data }): Promise<DashboardAgendaDayResult> => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const dayStart = startOfLocalDay(data.date);
    const dayEnd = endOfLocalDay(data.date);

    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        gte(appointments.beginAt, dayStart),
        lte(appointments.beginAt, dayEnd),
      ),
      orderBy: (appointments, { asc }) => [asc(appointments.beginAt)],
      with: {
        patient: {
          columns: {
            id: true,
            name: true,
            breed: true,
          },
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
              },
            },
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
        reports: {
          columns: {
            id: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      selectedDate: data.date,
      appointments: rows.map((row) => ({
        id: row.id,
        beginAt: row.beginAt,
        endAt: row.endAt,
        status: row.status,
        atHome: row.atHome,
        note: row.note,
        reports: row.reports.map((report) => ({
          id: report.id,
          status: report.status,
          updatedAt: report.updatedAt,
        })),
        patient: row.patient
          ? {
              id: row.patient.id,
              name: row.patient.name,
              breed: row.patient.breed,
              animal: row.patient.animal
                ? {
                    code: row.patient.animal.code,
                    name: row.patient.animal.name,
                  }
                : null,
              owner: row.patient.owner
                ? {
                    id: row.patient.owner.id,
                    name: row.patient.owner.name,
                  }
                : null,
            }
          : null,
      })),
    };
  });

function startOfLocalDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function endOfLocalDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
