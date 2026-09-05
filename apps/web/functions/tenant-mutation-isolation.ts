type EntityReference = { id: string };
type ReportReference = EntityReference & { appointmentId?: string | null };

type TenantReference = string | null | undefined;

export type PatientDependencyGraph = EntityReference & {
  organizationId: TenantReference;
  appointments?: Array<{
    organizationId: TenantReference;
    reports?: Array<{ createdBy: TenantReference }>;
  }>;
  advancedReport?: Array<{ createdBy: TenantReference }>;
  medicalDocuments?: Array<{ uploadedBy: TenantReference }>;
};

const INTEGRITY_ERROR =
  "Suppression impossible : l’intégrité des données liées ne peut pas être garantie.";

function hasForeignDependency(
  patient: PatientDependencyGraph,
  organizationId: string,
) {
  if (patient.organizationId !== organizationId) return true;

  if (
    patient.appointments?.some(
      (appointment) =>
        appointment.organizationId !== organizationId ||
        appointment.reports?.some(
          (report) => report.createdBy !== organizationId,
        ),
    )
  ) {
    return true;
  }

  if (
    patient.advancedReport?.some(
      (report) => report.createdBy !== organizationId,
    )
  ) {
    return true;
  }

  return Boolean(
    patient.medicalDocuments?.some(
      (document) => document.uploadedBy !== organizationId,
    ),
  );
}

export async function createAppointmentWithPatientIsolation<T>({
  findPatient,
  insertAppointment,
}: {
  findPatient: () => Promise<EntityReference | null | undefined>;
  insertAppointment: () => Promise<T>;
}) {
  const patient = await findPatient();
  if (!patient) throw new Error("Patient non trouvé");

  return insertAppointment();
}

export async function createReportWithTenantIsolation<T>({
  findPatient,
  findAppointment,
  insertReport,
}: {
  findPatient: () => Promise<EntityReference | null | undefined>;
  findAppointment?: () => Promise<EntityReference | null | undefined>;
  insertReport: () => Promise<T>;
}) {
  const patient = await findPatient();
  if (!patient) throw new Error("Patient non trouvé ou inaccessible");

  if (findAppointment && !(await findAppointment())) {
    throw new Error("Rendez-vous non trouvé ou incompatible");
  }

  return insertReport();
}

export async function updateAppointmentWithTenantIsolation<T>({
  findAppointment,
  findPatient,
  updateAppointment,
}: {
  findAppointment: () => Promise<EntityReference | null | undefined>;
  findPatient?: () => Promise<EntityReference | null | undefined>;
  updateAppointment: () => Promise<T>;
}) {
  if (!(await findAppointment())) {
    throw new Error("Rendez-vous non trouvé ou non autorisé");
  }

  if (findPatient && !(await findPatient())) {
    throw new Error("Patient non trouvé ou inaccessible");
  }

  return updateAppointment();
}

export async function updateReportWithTenantIsolation<T>({
  findReport,
  findPatient,
  validateAppointment,
  updateReport,
}: {
  findReport: () => Promise<ReportReference | null | undefined>;
  findPatient: () => Promise<EntityReference | null | undefined>;
  validateAppointment: (report: ReportReference) => Promise<boolean>;
  updateReport: (report: ReportReference) => Promise<T>;
}) {
  const report = await findReport();
  if (!report) throw new Error("Report not found or unauthorized");

  if (!(await findPatient())) {
    throw new Error("Patient non trouvé ou inaccessible");
  }

  if (!(await validateAppointment(report))) {
    throw new Error("Rendez-vous non trouvé ou incompatible");
  }

  return updateReport(report);
}

export async function createPatientWithOwnerIsolation<T>({
  findOwner,
  insertPatient,
}: {
  findOwner: () => Promise<EntityReference | null | undefined>;
  insertPatient: () => Promise<T>;
}) {
  const owner = await findOwner();
  if (!owner) {
    throw new Error("Propriétaire introuvable ou inaccessible.");
  }

  return insertPatient();
}

export async function deleteClientWithPatientIsolation<T>({
  deleteClient,
  findClient,
  findForeignPatient,
  findScopedPatients,
  organizationId,
}: {
  deleteClient: () => Promise<T>;
  findClient: () => Promise<EntityReference | null | undefined>;
  findForeignPatient: () => Promise<EntityReference | null | undefined>;
  findScopedPatients: () => Promise<PatientDependencyGraph[]>;
  organizationId: string;
}) {
  const client = await findClient();
  if (!client) {
    throw new Error("Client introuvable ou inaccessible.");
  }

  const foreignPatient = await findForeignPatient();
  if (foreignPatient) {
    throw new Error(INTEGRITY_ERROR);
  }

  const patients = await findScopedPatients();
  if (
    patients.some((patient) => hasForeignDependency(patient, organizationId))
  ) {
    throw new Error(INTEGRITY_ERROR);
  }

  return deleteClient();
}

export async function deletePatientWithDependencyIsolation<T>({
  deletePatient,
  findPatient,
  organizationId,
}: {
  deletePatient: () => Promise<T>;
  findPatient: () => Promise<PatientDependencyGraph | null | undefined>;
  organizationId: string;
}) {
  const patient = await findPatient();
  if (!patient) {
    throw new Error("Patient introuvable ou inaccessible.");
  }

  if (hasForeignDependency(patient, organizationId)) {
    throw new Error(INTEGRITY_ERROR);
  }

  return deletePatient();
}
