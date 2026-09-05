"use client";

import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { Client } from "@biume/db/schema/index";
import {
  CalendarClock,
  Contact2,
  Mail,
  PawPrint,
  Phone,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  DeleteEntityDialog,
  EntityRowActions,
} from "#/components/dashboard/lists/entity-row-actions";
import {
  canChangeClientFormOpenState,
  completeClientDeletion,
  getClientDeletionDescription,
  getClientDisplayName,
  getClientFormValues,
  handleClientDeletionError,
  handleClientEditError,
  invalidateClientLists,
  reconcileEditedClient,
  refreshClientListsAfterRemoval,
} from "#/components/dashboard/lists/entity-list.helpers";
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
  createClient,
  deleteClient,
  updateClient,
} from "#/lib/api/actions/clients.action";
import { clientsQueryOptions } from "#/lib/api/queries/clients.query";
import { cn } from "#/lib/utils";

type ClientsSearch = {
  search?: string;
  status?: string;
  page?: number;
};

/**
 * `Route.useSearch()` (TanStack) rendait un objet déjà validé par
 * `validateSearch`, partagé entre le loader et le composant. Next ne
 * partage pas cette valeur entre le Server Component (`page.tsx`, qui
 * applique la même normalisation pour son propre préchargement) et ce
 * composant client : `useSearchParams()` en est l'équivalent client (table
 * de correspondance), et cette fonction rejoue la normalisation de
 * `validateSearch` sur ce qu'il rend.
 */
function readSearch(searchParams: URLSearchParams): ClientsSearch {
  const rawSearch = searchParams.get("search");
  const rawStatus = searchParams.get("status");
  const rawPage = searchParams.get("page");

  return {
    search: rawSearch ?? "",
    status: rawStatus ?? "tous",
    page: rawPage !== null ? Number(rawPage) || 1 : 1,
  };
}

export function ClientsView() {
  const searchParams = useSearchParams();
  const search = readSearch(searchParams);
  const queryClient = useQueryClient();
  const { data: clients } = useSuspenseQuery(
    clientsQueryOptions({ search: search.search ?? "", limit: 250 }),
  );
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientToView, setClientToView] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const searchQuery = search.search ?? "";
  const statusFilter = search.status ?? "tous";
  const currentPage = Math.max(1, search.page ?? 1);
  const itemsPerPage = 10;

  // `navigate({ search: (previous) => ({ ...previous, ... }) })` (TanStack)
  // n'a pas d'équivalent direct : `useRouter().push` prend une URL déjà
  // construite. `previous` ici est le `search` lu ci-dessus (déjà "les
  // searchParams actuels"), donc l'appelant garde exactement la même forme
  // (une fonction de mise à jour reçue `previous` en argument).
  function navigateWithSearch(
    update: (previous: ClientsSearch) => ClientsSearch,
  ) {
    const next = update(search);
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.status) params.set("status", next.status);
    if (next.page) params.set("page", String(next.page));
    router.push(`/dashboard/clients?${params.toString()}`);
  }

  const filteredClients = clients.filter((client) => {
    const haystack = [
      client.name,
      client.email,
      client.phone,
      client.city,
      ...(client.pets ?? []).map((pet) => pet.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      haystack.includes(searchQuery.trim().toLowerCase());
    const lastActivity = getLastActivityDate(client);
    const isActive =
      lastActivity != null &&
      Date.now() - lastActivity.getTime() < 1000 * 60 * 60 * 24 * 180;
    const matchesStatus =
      statusFilter === "tous" ||
      (statusFilter === "actifs" && isActive) ||
      (statusFilter === "a_relancer" && !isActive);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / itemsPerPage),
  );
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const currentClientIds = currentClients.map((client) => client.id);
  const activeClients = clients.filter((client) =>
    getLastActivityDate(client),
  ).length;
  const totalPatients = clients.reduce(
    (sum, client) => sum + (client.pets?.length ?? 0),
    0,
  );
  const invalidateQuery = (queryKey: readonly string[]) =>
    queryClient.invalidateQueries({ queryKey });
  const navigateToPage = (page: number) => {
    navigateWithSearch((previous) => ({ ...previous, page }));
    return Promise.resolve();
  };
  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: async (_deletedClient, input) => {
      await completeClientDeletion({
        currentPage,
        close: () => setClientToDelete(null),
        invalidateQuery,
        navigateToPage,
        removedId: input.id,
        visibleIds: currentClientIds,
      });
      toast.success("Client supprimé.");
    },
    onError: async (error, input) => {
      const wasHandled = await handleClientDeletionError({
        error,
        currentPage,
        close: () => setClientToDelete(null),
        invalidateQuery,
        navigateToPage,
        removedId: input.id,
        visibleIds: currentClientIds,
      });

      if (wasHandled) {
        toast.error("Ce client n’existe plus. Les listes ont été actualisées.");
        return;
      }

      toast.error("Impossible de supprimer ce client. Réessayez.");
    },
  });

  function updateSearch(next: Partial<ClientsSearch>) {
    navigateWithSearch((previous) => ({ ...previous, ...next }));
  }

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Contact2}
          label="Clients"
          tone="emerald"
          value={clients.length}
          detail={`${activeClients} avec activité récente`}
        />
        <MetricCard
          icon={PawPrint}
          label="Patients rattachés"
          tone="sky"
          value={totalPatients}
          detail="Animaux dans le portefeuille"
        />
        <MetricCard
          icon={CalendarClock}
          label="Derniers ajouts"
          tone="amber"
          value={countCreatedThisMonth(clients)}
          detail="Nouveaux clients ce mois"
        />
      </section>

      <Panel>
        <PanelHeader
          action={
            <Button
              className="h-10 gap-2 bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.8)] hover:bg-slate-800"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Nouveau client
            </Button>
          }
          count={`${filteredClients.length} résultat${filteredClients.length > 1 ? "s" : ""}`}
          kicker="Répertoire"
          title="Clients et propriétaires."
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
                placeholder="Rechercher par nom, email, téléphone ou patient..."
                className="h-11 bg-white pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                updateSearch({ status: value, page: 1 })
              }
            >
              <SelectTrigger className="h-11 w-full bg-white lg:w-55">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les clients</SelectItem>
                <SelectItem value="actifs">Actifs récemment</SelectItem>
                <SelectItem value="a_relancer">À relancer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentClients.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Client
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Contact
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Patients
                      </TableHead>
                      <TableHead className="h-11 text-xs font-semibold uppercase text-slate-500">
                        Dernière activité
                      </TableHead>
                      <TableHead className="h-11 text-right text-xs font-semibold uppercase text-slate-500">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="border-slate-100 transition duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <InitialsBadge name={client.name ?? "Client"} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {client.name ?? "Client sans nom"}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {[client.city, client.country]
                                  .filter(Boolean)
                                  .join(", ") || "Adresse non renseignée"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="grid gap-1 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <Mail className="size-3.5 text-slate-400" />
                              {client.email || "Email manquant"}
                            </span>
                            <span className="flex items-center gap-2">
                              <Phone className="size-3.5 text-slate-400" />
                              {client.phone || "Téléphone manquant"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-800"
                          >
                            {client.pets?.length ?? 0} patient
                            {(client.pets?.length ?? 0) > 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-slate-600">
                          {formatDate(getLastActivityDate(client))}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <EntityRowActions
                            entityName={getClientDisplayName(client.name)}
                            onView={() => setClientToView(client)}
                            onEdit={() => setClientToEdit(client)}
                            onDelete={() => setClientToDelete(client)}
                          />
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
              title="Aucun client trouvé"
              description="Modifiez la recherche ou les filtres pour retrouver un propriétaire."
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    updateSearch({ search: "", status: "tous", page: 1 })
                  }
                >
                  Réinitialiser
                </Button>
              }
            />
          )}
        </div>
      </Panel>

      {isCreateOpen ? (
        <ClientFormDialog
          key="create-client"
          open
          onOpenChange={setIsCreateOpen}
        />
      ) : null}
      {clientToEdit ? (
        <ClientFormDialog
          key={clientToEdit.id}
          client={clientToEdit}
          open
          onOpenChange={(open) => {
            if (!open) {
              const editedId = clientToEdit.id;
              setClientToEdit((current) =>
                reconcileEditedClient(current, editedId),
              );
            }
          }}
          onStale={async (editedId) => {
            setClientToEdit((current) =>
              reconcileEditedClient(current, editedId),
            );
            await refreshClientListsAfterRemoval({
              currentPage,
              invalidateQuery,
              navigateToPage,
              removedId: editedId,
              visibleIds: currentClientIds,
            });
          }}
        />
      ) : null}
      {clientToView ? (
        <ClientDetailsDialog
          client={clientToView}
          open
          onOpenChange={(open) => {
            if (!open) setClientToView(null);
          }}
        />
      ) : null}
      <DeleteEntityDialog
        open={clientToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setClientToDelete(null);
        }}
        title={`Supprimer ${getClientDisplayName(clientToDelete?.name)} ?`}
        description={getClientDeletionDescription(
          clientToDelete?.pets?.length ?? 0,
        )}
        confirmLabel="Supprimer le client"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (clientToDelete) {
            deleteMutation.mutate({ id: clientToDelete.id });
          }
        }}
      />
    </div>
  );
}

const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom du client est requis."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      "L'email doit être valide.",
    ),
  phone: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim(),
  zip: z.string().trim(),
  country: z.string().trim(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

function ClientFormDialog({
  client,
  onOpenChange,
  onStale,
  open,
}: {
  client?: Client | null;
  onOpenChange: (open: boolean) => void;
  onStale?: (clientId: string) => Promise<void>;
  open: boolean;
}) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(client);
  const form = useForm({
    defaultValues: getClientFormValues(client) satisfies ClientFormValues,
    validators: {
      onSubmit: clientFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const parsed = clientFormSchema.parse(value);

        if (client) {
          await updateClient({
            id: client.id,
            ...parsed,
          });
        } else {
          await createClient(parsed);
        }
        await invalidateClientLists((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        );
        toast.success(client ? "Client modifié." : "Client créé.");
        form.reset();
        onOpenChange(false);
      } catch (error) {
        const wasStale = client
          ? await handleClientEditError({
            clientId: client.id,
            error,
            onStale: async (clientId) => {
              if (onStale) {
                await onStale(clientId);
                return;
              }

              await invalidateClientLists((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
              );
              onOpenChange(false);
            },
          })
          : false;

        if (wasStale) {
          toast.error(
            "Ce client n’existe plus. Les listes ont été actualisées.",
          );
          return;
        }

        toast.error(
          isEditing
            ? "Impossible de modifier ce client. Réessayez."
            : "Impossible de créer ce client. Réessayez.",
        );
      }
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!canChangeClientFormOpenState(nextOpen, form.state.isSubmitting)) {
      return;
    }

    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Credenza open={open} onOpenChange={handleOpenChange}>
      <CredenzaContent className="overflow-hidden p-0 sm:max-w-2xl">
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
                <Contact2 className="size-5" />
              </div>
              <CredenzaHeader className="min-w-0 flex-1 gap-1 text-left">
                <CredenzaTitle className="text-xl font-semibold tracking-tight text-slate-950">
                  {isEditing ? "Modifier le client" : "Nouveau client"}
                </CredenzaTitle>
                <CredenzaDescription className="text-sm leading-relaxed text-slate-600">
                  {isEditing
                    ? "Actualisez les coordonnées utiles au suivi de ce propriétaire."
                    : "Créez une fiche propriétaire avec les coordonnées utiles au suivi."}
                </CredenzaDescription>
              </CredenzaHeader>
            </div>
          </div>

          <div className="grid gap-5 overflow-y-auto px-6 py-5">
            <form.Field
              name="name"
              children={(field) => (
                <FormField
                  error={getFieldError(field.state.meta.errors)}
                  htmlFor={field.name}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  label="Nom complet"
                >
                  <Input
                    id={field.name}
                    name={field.name}
                    className="h-11 bg-white"
                    placeholder="Marie Dupont"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                </FormField>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="email"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Email"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="client@email.fr"
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
                name="phone"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Téléphone"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="06 12 34 56 78"
                      value={field.state.value ?? ""}
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

            <form.Field
              name="address"
              children={(field) => (
                <FormField
                  error={getFieldError(field.state.meta.errors)}
                  htmlFor={field.name}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  label="Adresse"
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    className="min-h-20 bg-white"
                    placeholder="12 rue des Lilas"
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

            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field
                name="city"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Ville"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="Bordeaux"
                      value={field.state.value ?? ""}
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
                name="zip"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Code postal"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="33000"
                      value={field.state.value ?? ""}
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
                name="country"
                children={(field) => (
                  <FormField
                    error={getFieldError(field.state.meta.errors)}
                    htmlFor={field.name}
                    isInvalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    label="Pays"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      className="h-11 bg-white"
                      placeholder="France"
                      value={field.state.value ?? ""}
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
          </div>

          <CredenzaFooter className="mb-0 border-t border-slate-200 bg-white px-6 pb-6 pt-4">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
              children={({ canSubmit, isSubmitting }) => (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="gap-2 bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {isSubmitting
                      ? isEditing
                        ? "Modification..."
                        : "Création..."
                      : isEditing
                        ? "Enregistrer les modifications"
                        : "Créer le client"}
                  </Button>
                </>
              )}
            />
          </CredenzaFooter>
        </form>
      </CredenzaContent>
    </Credenza>
  );
}

function ClientDetailsDialog({
  client,
  onOpenChange,
  open,
}: {
  client: Client;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const address = [client.address, client.zip, client.city, client.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="overflow-hidden p-0 sm:max-w-xl">
        <div className="flex max-h-[calc(100dvh-3rem)] flex-col">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
            <div className="flex min-w-0 items-start gap-4 pr-8">
              <InitialsBadge name={getClientDisplayName(client.name)} />
              <CredenzaHeader className="min-w-0 flex-1 gap-1 text-left">
                <CredenzaTitle className="min-w-0 wrap-break-word text-xl font-semibold tracking-tight text-slate-950">
                  {getClientDisplayName(client.name)}
                </CredenzaTitle>
                <CredenzaDescription className="text-sm leading-relaxed text-slate-600">
                  Coordonnées du propriétaire et patients rattachés à cette
                  fiche.
                </CredenzaDescription>
              </CredenzaHeader>
            </div>
          </div>

          <div className="grid gap-6 overflow-y-auto px-6 py-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 grid gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="min-w-0 wrap-break-word text-sm text-slate-800">
                  {client.email || "Email non renseigné"}
                </dd>
              </div>
              <div className="min-w-0 grid gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Téléphone
                </dt>
                <dd className="min-w-0 wrap-break-word text-sm text-slate-800">
                  {client.phone || "Téléphone non renseigné"}
                </dd>
              </div>
              <div className="min-w-0 grid gap-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Adresse
                </dt>
                <dd className="min-w-0 wrap-break-word text-sm leading-6 text-slate-800">
                  {address || "Adresse non renseignée"}
                </dd>
              </div>
            </dl>

            <section aria-labelledby={`client-${client.id}-patients`}>
              <h3
                id={`client-${client.id}-patients`}
                className="text-sm font-semibold text-slate-950"
              >
                Patients ({client.pets?.length ?? 0})
              </h3>
              {client.pets?.length ? (
                <ul className="mt-3 grid gap-2">
                  {client.pets.map((pet) => (
                    <li
                      key={pet.id}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800"
                    >
                      <PawPrint className="size-4 shrink-0 text-emerald-700" />
                      <span className="min-w-0 wrap-break-word">{pet.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                  Aucun patient rattaché
                </p>
              )}
            </section>
          </div>

          <CredenzaFooter className="mb-0 border-t border-slate-200 bg-white px-6 pb-6 pt-4">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </CredenzaFooter>
        </div>
      </CredenzaContent>
    </Credenza>
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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6">
      {children}
    </section>
  );
}

function PanelHeader({
  action,
  count,
  kicker,
  title,
}: {
  action?: React.ReactNode;
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
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="text-sm text-slate-500">{count}</div>
        {action}
      </div>
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
  icon: typeof Contact2;
  label: string;
  tone: "emerald" | "sky" | "amber" | "slate";
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
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

function InitialsBadge({ name }: { name: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-900">
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || <UserRound className="size-4" />}
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

function getLastActivityDate(client: Client) {
  const reportDates =
    client.pets
      ?.flatMap((pet) => pet.advancedReport ?? [])
      .map((report) => report.createdAt)
      .filter(Boolean)
      .map((date) => new Date(date as Date)) ?? [];
  const fallback = client.updatedAt ?? client.createdAt;

  return [...reportDates, fallback ? new Date(fallback) : null]
    .filter(
      (date): date is Date =>
        date instanceof Date && !Number.isNaN(date.getTime()),
    )
    .sort((a, b) => b.getTime() - a.getTime())[0];
}

function countCreatedThisMonth(clients: Client[]) {
  const now = new Date();
  return clients.filter((client) => {
    if (!client.createdAt) {
      return false;
    }
    const createdAt = new Date(client.createdAt);
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;
}

function formatDate(date?: Date | null) {
  if (!date) {
    return "Aucune activité";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
