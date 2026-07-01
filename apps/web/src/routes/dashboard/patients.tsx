import { useForm } from "@tanstack/react-form";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { Client, Pet } from "@biume/db/schema/index";
import {
  Activity,
  CalendarClock,
  Eye,
  PawPrint,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AnimalCredenza } from "#/components/animal-folder";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "#/components/ui/credenza";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Textarea } from "#/components/ui/textarea";
import {
  createPatient,
  type AnimalOption,
} from "#/lib/api/actions/patients.action";
import { clientsQueryOptions } from "#/lib/api/queries/clients.query";
import {
  animalsQueryOptions,
  patientsQueryOptions,
} from "#/lib/api/queries/patients.query";
import { cn } from "#/lib/utils";

type PatientsSearch = {
  search?: string;
  type?: string;
  page?: number;
};

export const Route = createFileRoute("/dashboard/patients")({
  head: () => ({
    meta: [
      { title: "Patients | Biume" },
      {
        name: "description",
        content: "Consultez et suivez les patients animaux de votre espace.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): PatientsSearch => ({
    search: typeof search.search === "string" ? search.search : "",
    type: typeof search.type === "string" ? search.type : "tous",
    page:
      typeof search.page === "number"
        ? search.page
        : Number(search.page ?? 1) || 1,
  }),
  loaderDeps: ({ search }) => ({
    search: search.search ?? "",
    type: search.type ?? "tous",
  }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        patientsQueryOptions({
          search: deps.search,
          type: deps.type,
          limit: 250,
        }),
      ),
      context.queryClient.ensureQueryData(clientsQueryOptions({ limit: 250 })),
      context.queryClient.ensureQueryData(animalsQueryOptions()),
    ]),
  component: PatientsPage,
});

function PatientsPage() {
  const search = Route.useSearch();
  const { data: patients } = useSuspenseQuery(
    patientsQueryOptions({
      search: search.search ?? "",
      type: search.type ?? "tous",
      limit: 250,
    }),
  );
  const { data: clients } = useSuspenseQuery(
    clientsQueryOptions({ limit: 250 }),
  );
  const { data: animals } = useSuspenseQuery(animalsQueryOptions());
  const navigate = useNavigate({ from: "/dashboard/patients" });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const searchQuery = search.search ?? "";
  const typeFilter = search.type ?? "tous";
  const currentPage = Math.max(1, search.page ?? 1);
  const itemsPerPage = 10;
  const typeOptions = Array.from(
    new Set(
      patients
        .map((patient) => patient.animal?.name)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredPatients = patients.filter((patient) => {
    const haystack = [
      patient.name,
      patient.breed,
      patient.owner?.name,
      patient.animal?.name,
      patient.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      haystack.includes(searchQuery.trim().toLowerCase());
    const matchesType =
      typeFilter === "tous" || patient.animal?.name === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / itemsPerPage),
  );
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const reportsCount = patients.reduce(
    (sum, patient) => sum + (patient.advancedReport?.length ?? 0),
    0,
  );
  const recentPatients = patients.filter((patient) =>
    isDateInLastDays(patient.createdAt, 30),
  ).length;

  function updateSearch(next: Partial<PatientsSearch>) {
    navigate({
      search: (previous) => ({ ...previous, ...next }),
    });
  }

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <PageHeader
        badge="Suivi patients"
        description="Centralisez les animaux suivis, leur propriétaire et les derniers rapports associés."
        icon={PawPrint}
        metricLabel={`${patients.length} patient${patients.length > 1 ? "s" : ""}`}
        metricSubLabel={`${reportsCount} rapport${reportsCount > 1 ? "s" : ""} associés`}
        title="Patients."
        action={
          <Button
            className="h-11 gap-2 bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.8)] hover:bg-slate-800"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" />
            Nouveau patient
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          detail="Animaux enregistrés"
          icon={PawPrint}
          label="Patients"
          tone="emerald"
          value={patients.length}
        />
        <MetricCard
          detail="Créés sur les 30 derniers jours"
          icon={CalendarClock}
          label="Nouveaux"
          tone="sky"
          value={recentPatients}
        />
        <MetricCard
          detail="Comptes rendus rattachés"
          icon={Stethoscope}
          label="Rapports"
          tone="amber"
          value={reportsCount}
        />
      </section>

      <Panel>
        <PanelHeader
          count={`${filteredPatients.length} résultat${filteredPatients.length > 1 ? "s" : ""}`}
          kicker="Dossiers patients"
          title="Animaux suivis."
        />

        <div className="grid gap-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) =>
                  updateSearch({ search: event.target.value, page: 1 })
                }
                placeholder="Rechercher par nom, race, espèce ou propriétaire..."
                className="h-11 bg-white pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) => updateSearch({ type: value, page: 1 })}
            >
              <SelectTrigger className="h-11 w-full bg-white lg:w-[220px]">
                <SelectValue placeholder="Espèce" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les espèces</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentPatients.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Patient
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Espèce
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Morphologie
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Propriétaire
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Dernier rapport
                      </TableHead>
                      <TableHead className="h-11 text-right text-xs font-semibold uppercase text-slate-500">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="border-slate-100 transition duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <PatientAvatar patient={patient} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {patient.name}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {patient.breed || "Race non renseignée"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-800"
                          >
                            {patient.animal?.name ?? "Espèce inconnue"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="grid gap-1 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <Weight className="size-3.5 text-slate-400" />
                              {patient.weight
                                ? `${patient.weight} kg`
                                : "Poids NC"}
                            </span>
                            <span className="flex items-center gap-2">
                              <Activity className="size-3.5 text-slate-400" />
                              {formatAge(patient.birthDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-slate-600">
                          {patient.owner?.name ?? "Propriétaire inconnu"}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-slate-600">
                          {formatDate(getLatestReportDate(patient))}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() => setSelectedPatientId(patient.id)}
                          >
                            <Eye className="size-4" />
                            <span className="sr-only">Voir le dossier</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateSearch({ page })}
              />
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="Aucun patient trouvé"
              description="Modifiez la recherche ou le filtre d'espèce pour retrouver un dossier."
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    updateSearch({ search: "", type: "tous", page: 1 })
                  }
                >
                  Réinitialiser
                </Button>
              }
            />
          )}
        </div>
      </Panel>

      {selectedPatientId ? (
        <AnimalCredenza
          isOpen={selectedPatientId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPatientId(null);
            }
          }}
          petId={selectedPatientId}
        />
      ) : null}

      <CreatePatientDialog
        animals={animals}
        clients={clients}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}

const patientFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom du patient est requis."),
  ownerId: z.string().trim().min(1, "Sélectionnez un propriétaire."),
  type: z.string().trim().min(1, "Sélectionnez une espèce."),
  breed: z.string().trim().min(1, "La race est requise."),
  gender: z.enum(["Male", "Female"]),
  birthDate: z.string().trim().min(1, "La date de naissance est requise."),
  weight: z.coerce.number().int().min(0, "Le poids doit être positif."),
  height: z.coerce.number().int().min(0, "La taille doit être positive."),
  description: z.string().trim().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

function CreatePatientDialog({
  animals,
  clients,
  onOpenChange,
  open,
}: {
  animals: AnimalOption[];
  clients: Client[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const queryClient = useQueryClient();
  const defaultValues = {
    name: "",
    ownerId: clients[0]?.id ?? "",
    type: animals[0]?.id ?? "",
    breed: "",
    gender: "Male",
    birthDate: "",
    weight: 0,
    height: 0,
    description: "",
  } satisfies PatientFormValues;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: patientFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const parsed = patientFormSchema.parse(value);
        await createPatient({
          ...parsed,
          birthDate: new Date(parsed.birthDate),
          description: parsed.description || undefined,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["patients"] }),
          queryClient.invalidateQueries({ queryKey: ["clients"] }),
        ]);
        toast.success("Patient créé.");
        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de créer ce patient.",
        );
      }
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  }

  const hasRequiredRelations = clients.length > 0 && animals.length > 0;

  return (
    <Credenza open={open} onOpenChange={handleOpenChange}>
      <CredenzaContent className="overflow-hidden p-0 sm:max-w-3xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex max-h-[calc(100dvh-3rem)] flex-col"
        >
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
            <div className="flex items-start gap-4 pr-8">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                <PawPrint className="size-5" />
              </div>
              <CredenzaHeader className="min-w-0 flex-1 gap-1 text-left">
                <CredenzaTitle className="text-xl font-semibold tracking-tight text-slate-950">
                  Nouveau patient
                </CredenzaTitle>
                <CredenzaDescription className="text-sm leading-relaxed text-slate-600">
                  Ajoutez un animal et rattachez-le à un propriétaire existant.
                </CredenzaDescription>
              </CredenzaHeader>
            </div>
          </div>

          <div className="grid gap-5 overflow-y-auto px-6 py-5">
            {!hasRequiredRelations ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Ajoutez au moins un client et une espèce avant de créer un
                patient.
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="name"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Nom du patient"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="Nala"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                  </FormField>
                )}
              />
              <form.Field
                name="breed"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Race"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="Berger australien"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                  </FormField>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field
                name="ownerId"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Propriétaire"
                  >
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      disabled={clients.length === 0}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="h-11 w-full bg-white"
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name ?? "Client sans nom"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
              <form.Field
                name="type"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Espèce"
                  >
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      disabled={animals.length === 0}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="h-11 w-full bg-white"
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {animals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name ?? animal.code ?? "Espèce"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
              <form.Field
                name="gender"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Sexe"
                  >
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="h-11 w-full bg-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Mâle</SelectItem>
                        <SelectItem value="Female">Femelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field
                name="birthDate"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Naissance"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      className="h-11 bg-white"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                  </FormField>
                )}
              />
              <form.Field
                name="weight"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Poids (kg)"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      className="h-11 bg-white"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.valueAsNumber || 0)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                  </FormField>
                )}
              />
              <form.Field
                name="height"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Taille (cm)"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      className="h-11 bg-white"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.valueAsNumber || 0)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                  </FormField>
                )}
              />
            </div>

            <form.Field
              name="description"
              children={(field) => (
                <FormField
                  error={getFieldError(field.state.meta.errors)}
                  htmlFor={field.name}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  label="Notes"
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    className="min-h-24 bg-white"
                    placeholder="Informations utiles au suivi..."
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormField>
              )}
            />
          </div>

          <CredenzaFooter className="border-t border-slate-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
              children={({ canSubmit, isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={!hasRequiredRelations || !canSubmit || isSubmitting}
                  className="gap-2 bg-slate-950 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? "Création..." : "Créer le patient"}
                </Button>
              )}
            />
          </CredenzaFooter>
        </form>
      </CredenzaContent>
    </Credenza>
  );
}

function PageHeader({
  badge,
  description,
  icon: Icon,
  metricLabel,
  metricSubLabel,
  title,
  action,
}: {
  action?: React.ReactNode;
  badge: string;
  description: string;
  icon: typeof PawPrint;
  metricLabel: string;
  metricSubLabel: string;
  title: string;
}) {
  return (
    <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="min-w-0">
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
          <Sparkles className="size-3.5 text-emerald-700" />
          {badge}
        </div>
        <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          {description}
        </p>
      </div>
      <div className="grid gap-3">
        {action ? (
          <div className="flex justify-start lg:justify-end">{action}</div>
        ) : null}
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
          <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {metricLabel}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {metricSubLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function FormField({
  children,
  error,
  htmlFor,
  isInvalid,
  label,
}: {
  children: React.ReactNode;
  error: string;
  htmlFor: string;
  isInvalid: boolean;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
        {label}
      </Label>
      {children}
      {isInvalid && error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function getFieldError(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;
      return "Champ invalide.";
    })
    .join(", ");
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6">
      {children}
    </section>
  );
}

function PanelHeader({
  count,
  kicker,
  title,
}: {
  count: string;
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-5 grid gap-4 border-b border-slate-200 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-sm font-medium text-emerald-700">{kicker}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      </div>
      <div className="text-sm text-slate-500">{count}</div>
    </div>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: typeof PawPrint;
  label: string;
  tone: "emerald" | "sky" | "amber" | "slate";
  value: number | string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            tone === "emerald" &&
              "border-emerald-200 bg-emerald-50 text-emerald-800",
            tone === "sky" && "border-sky-200 bg-sky-50 text-sky-800",
            tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
            tone === "slate" && "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function PatientAvatar({ patient }: { patient: Pet }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-900">
      {patient.image ? (
        <img
          src={patient.image}
          alt=""
          className="size-full object-cover"
          width={40}
          height={40}
        />
      ) : (
        patient.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("") || <UserRound className="size-4" />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Page {currentPage} sur {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: typeof Search;
  title: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function getLatestReportDate(patient: Pet) {
  return patient.advancedReport
    ?.map((report) => report.createdAt)
    .filter(Boolean)
    .map((date) => new Date(date as Date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
}

function formatAge(value?: Date | string | null) {
  if (!value) {
    return "Âge NC";
  }

  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return `${Math.max(age, 0)} an${age > 1 ? "s" : ""}`;
}

function isDateInLastDays(
  value: Date | string | null | undefined,
  days: number,
) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return Date.now() - date.getTime() < days * 24 * 60 * 60 * 1000;
}

function formatDate(date?: Date | null) {
  if (!date) {
    return "Aucun rapport";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
