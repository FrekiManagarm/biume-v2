import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import {
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CreditCard,
  Crown,
  ImageIcon,
  LoaderCircle,
  Mail,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { getSession } from "#/functions/auth.function";
import {
  getOrganizationSettings,
  updateOrganization,
} from "#/functions/organization.function";
import { updateUserNotifications } from "#/functions/user.function";
import { autumnFeatureIds, autumnPlanIds } from "#/lib/constants/autumn-ids";
import { cn } from "#/lib/utils";
import { useUploadThing } from "#/lib/utils/uploadthing";

const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisation est requis.").max(120),
  slug: z.string().min(1, "Le slug est requis.").max(140),
  email: z.union([z.email("L'email de contact est invalide."), z.literal("")]),
  description: z.string().max(1200),
  lang: z.enum(["fr", "en"]),
  ai: z.boolean(),
  logo: z.union([z.url("L'URL du logo est invalide."), z.literal("")]),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
});

type OrganizationSettingsValues = z.infer<typeof organizationSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type SettingsTabId = "organization" | "notifications" | "billing";
type FieldErrorValue = { message?: string } | string | undefined;
type SettingsFormApi = any;
type SettingsFieldApi = any;
type SettingsFormState = {
  canSubmit: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  values: Record<string, any>;
};

const tabs: Array<{
  id: SettingsTabId;
  title: string;
  description: string;
  icon: typeof Building2;
}> = [
  {
    id: "organization",
    title: "Organisation",
    description: "Identité, langue et IA",
    icon: Building2,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Préférences de contact",
    icon: Bell,
  },
  {
    id: "billing",
    title: "Facturation",
    description: "Plan et abonnement",
    icon: CreditCard,
  },
];

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres | Biume" },
      {
        name: "description",
        content: "Gérez les paramètres de votre espace Biume.",
      },
    ],
  }),
  loader: async () => {
    const [session, organization] = await Promise.all([
      getSession(),
      getOrganizationSettings(),
    ]);

    return { session, organization };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();
  const { session, organization } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("organization");
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing(
    "organizationLogoUploader",
    {
      onUploadProgress: setLogoUploadProgress,
    },
  );

  const {
    check,
    data: customer,
    attach,
    updateSubscription,
  } = useCustomer({
    expand: ["invoices"],
  });

  const aiFeatureAllowed =
    check?.({ featureId: autumnFeatureIds.iaVulgarisation }).allowed ?? false;

  const organizationForm = useForm({
    defaultValues: {
      name: organization.name ?? "",
      slug:
        organization.slug ?? createOrganizationSlug(organization.name ?? ""),
      email: organization.email ?? "",
      description: organization.description ?? "",
      lang: organization.lang === "en" ? "en" : "fr",
      ai: organization.ai ?? false,
      logo: organization.logo ?? "",
    } satisfies OrganizationSettingsValues,
    validators: {
      onSubmit: organizationSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      await updateOrganization({
        data: organizationSettingsSchema.parse(value),
      });
      await router.invalidate();
      toast.success("Organisation mise à jour.");
    },
  });

  const notificationForm = useForm({
    defaultValues: {
      emailNotifications: session?.user.emailNotifications ?? false,
    } satisfies NotificationSettingsValues,
    validators: {
      onSubmit: notificationSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUserNotifications({
        data: notificationSettingsSchema.parse(value),
      });
      await router.invalidate();
      toast.success("Préférences enregistrées.");
    },
  });

  async function handleLogoChange(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    try {
      setLogoUploadProgress(0);
      const uploadedFiles = await startUpload([file]);
      const uploadedFile = uploadedFiles?.[0];
      const logoUrl = uploadedFile?.ufsUrl || uploadedFile?.url;

      if (!logoUrl) {
        throw new Error("Impossible de récupérer l'URL du logo importé.");
      }

      organizationForm.setFieldValue("logo", logoUrl);
      setLogoUploadProgress(100);
      toast.success("Logo importé. Enregistrez pour appliquer.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'importer ce logo pour le moment.",
      );
    }
  }

  return (
    <div className="min-h-full w-full pb-8 text-slate-950">
      <div className="grid w-full gap-6">
        <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
              <Sparkles className="size-3.5 text-emerald-700" />
              Espace actif
            </div>
            <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
              Paramètres.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Ajustez l'identité de votre organisation, vos préférences de
              contact et votre abonnement Biume.
            </p>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
            <OrganizationLogo
              logo={organizationForm.getFieldValue("logo")}
              name={organization.name}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {organization.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {organization.slug
                  ? `${organization.slug}.biume`
                  : "Organisation Biume"}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <nav className="divide-y divide-slate-200 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 text-left transition duration-300 ease-out hover:bg-slate-50 active:scale-[0.99] sm:px-5",
                      isActive
                        ? "bg-emerald-50/70 text-slate-950"
                        : "text-slate-600 hover:text-slate-950",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl border transition duration-300",
                        isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {tab.title}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-xs",
                          isActive ? "text-emerald-800" : "text-slate-500",
                        )}
                      >
                        {tab.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "size-2 rounded-full transition duration-300",
                        isActive ? "bg-emerald-600" : "bg-transparent",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">
            {activeTab === "organization" ? (
              <OrganizationTab
                aiFeatureAllowed={aiFeatureAllowed}
                form={organizationForm}
                isUploading={isUploading}
                logoUploadProgress={logoUploadProgress}
                onLogoChange={handleLogoChange}
              />
            ) : null}
            {activeTab === "notifications" ? (
              <NotificationsTab form={notificationForm} />
            ) : null}
            {activeTab === "billing" ? (
              <BillingTab
                attach={attach}
                customer={customer}
                updateSubscription={updateSubscription}
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function OrganizationTab({
  aiFeatureAllowed,
  form,
  isUploading,
  logoUploadProgress,
  onLogoChange,
}: {
  aiFeatureAllowed: boolean;
  form: SettingsFormApi;
  isUploading: boolean;
  logoUploadProgress: number;
  onLogoChange: (files: FileList | null) => Promise<void>;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-5"
    >
      <Panel>
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <form.Subscribe
            selector={(state: SettingsFormState) => ({
              logo: state.values.logo,
              name: state.values.name,
            })}
            children={({ logo, name }: { logo?: string; name?: string }) => (
              <OrganizationLogo logo={logo} name={name} size="lg" />
            )}
          />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Identité professionnelle
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Ces informations apparaissent dans votre espace de travail et
              servent de base aux documents partagés.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98]">
              {isUploading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? `${logoUploadProgress}%` : "Logo"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => void onLogoChange(event.target.files)}
              />
            </label>
            <form.Subscribe
              selector={(state: SettingsFormState) => ({
                canSubmit: state.canSubmit,
                isDirty: state.isDirty,
                isSubmitting: state.isSubmitting,
              })}
              children={({
                canSubmit,
                isDirty,
                isSubmitting,
              }: SettingsFormState) => (
                <Button
                  type="submit"
                  className="h-10 active:scale-[0.98]"
                  disabled={
                    !canSubmit || !isDirty || isSubmitting || isUploading
                  }
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                  {isSubmitting ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      data-icon="inline-end"
                    />
                  ) : (
                    <Save className="size-4" data-icon="inline-end" />
                  )}
                </Button>
              )}
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Panel>
          <div className="mb-5 border-b border-slate-200 pb-5">
            <p className="text-sm font-medium text-emerald-700">
              Informations principales
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Coordonnées de l'activité.
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <form.Field
              name="name"
              children={(field: SettingsFieldApi) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <FieldBlock
                    error={
                      isInvalid ? getErrorText(field.state.meta.errors) : ""
                    }
                    htmlFor={field.name}
                    label="Nom de l'entreprise"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.handleChange(value);
                        form.setFieldValue(
                          "slug",
                          createOrganizationSlug(value),
                        );
                      }}
                      aria-invalid={isInvalid}
                      className="h-11 bg-white"
                      placeholder="Clinique Vétérinaire Les Alizés"
                    />
                  </FieldBlock>
                );
              }}
            />

            <form.Field
              name="slug"
              children={(field: SettingsFieldApi) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <FieldBlock
                    error={
                      isInvalid ? getErrorText(field.state.meta.errors) : ""
                    }
                    htmlFor={field.name}
                    label="Slug"
                  >
                    <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-input bg-white focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        readOnly
                        className="h-11 border-0 bg-slate-50 shadow-none focus-visible:ring-0"
                        aria-invalid={isInvalid}
                      />
                      <span className="flex items-center border-l border-slate-200 px-3 text-sm text-slate-500">
                        .biume
                      </span>
                    </div>
                  </FieldBlock>
                );
              }}
            />

            <form.Field
              name="email"
              children={(field: SettingsFieldApi) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <FieldBlock
                    error={
                      isInvalid ? getErrorText(field.state.meta.errors) : ""
                    }
                    htmlFor={field.name}
                    label="Email de contact"
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      className="h-11 bg-white"
                      placeholder="contact@clinique.fr"
                    />
                  </FieldBlock>
                );
              }}
            />

            <form.Field
              name="lang"
              children={(field: SettingsFieldApi) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <FieldBlock
                    error={
                      isInvalid ? getErrorText(field.state.meta.errors) : ""
                    }
                    htmlFor={field.name}
                    label="Langue"
                  >
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value === "en" ? "en" : "fr")
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="h-11 w-full bg-white"
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      >
                        <SelectValue placeholder="Choisir une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldBlock>
                );
              }}
            />
          </div>

          <form.Field
            name="description"
            children={(field: SettingsFieldApi) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <FieldBlock
                  className="mt-5"
                  error={isInvalid ? getErrorText(field.state.meta.errors) : ""}
                  htmlFor={field.name}
                  label="Description"
                >
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    className="min-h-28 bg-white"
                    placeholder="Décrivez votre activité de thérapeute animalier..."
                  />
                </FieldBlock>
              );
            }}
          />
        </Panel>

        <Panel className="self-start">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold tracking-tight text-slate-950">
                  Vulgarisation IA
                </h3>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Beta
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Activez la vulgarisation automatique des rapports lorsque votre
                plan le permet.
              </p>
            </div>
          </div>

          <form.Field
            name="ai"
            children={(field: SettingsFieldApi) => (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    {field.state.value ? "Activée" : "Désactivée"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {aiFeatureAllowed
                      ? "Disponible sur votre abonnement."
                      : "Nécessite un plan compatible."}
                  </p>
                </div>
                <Switch
                  checked={field.state.value}
                  disabled={!aiFeatureAllowed}
                  onBlur={field.handleBlur}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
              </div>
            )}
          />
        </Panel>
      </div>
    </form>
  );
}

function NotificationsTab({ form }: { form: SettingsFormApi }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-5"
    >
      <Panel>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
            <Bell className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Notifications
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Préférences de contact.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Cette première version reprend la préférence email principale. Les
              canaux avancés pourront être ajoutés ensuite.
            </p>
          </div>
        </div>

        <form.Field
          name="emailNotifications"
          children={(field: SettingsFieldApi) => (
            <div className="mt-6 flex flex-col gap-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                  <Mail className="size-4" />
                </div>
                <div>
                  <Label htmlFor={field.name} className="text-sm font-semibold">
                    Notifications par email
                  </Label>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Recevoir les rappels et mises à jour importantes de Biume.
                  </p>
                </div>
              </div>
              <Switch
                id={field.name}
                checked={field.state.value}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
            </div>
          )}
        />
      </Panel>

      <div className="flex justify-end">
        <form.Subscribe
          selector={(state: SettingsFormState) => ({
            canSubmit: state.canSubmit,
            isDirty: state.isDirty,
            isSubmitting: state.isSubmitting,
          })}
          children={({
            canSubmit,
            isDirty,
            isSubmitting,
          }: SettingsFormState) => (
            <Button
              type="submit"
              className="h-10 active:scale-[0.98]"
              disabled={!canSubmit || !isDirty || isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              {isSubmitting ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  data-icon="inline-end"
                />
              ) : (
                <Save className="size-4" data-icon="inline-end" />
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}

function BillingTab({
  attach,
  customer,
  updateSubscription,
}: {
  attach: ReturnType<typeof useCustomer>["attach"];
  customer: ReturnType<typeof useCustomer>["data"];
  updateSubscription: ReturnType<typeof useCustomer>["updateSubscription"];
}) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const activeSubscription = customer?.subscriptions?.find((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
  const subscriptionStatus = getSubscriptionStatus(activeSubscription);

  async function handleUpgrade() {
    try {
      setIsUpgrading(true);
      await attach({
        planId: autumnPlanIds.allInclusiveYearly,
        successUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ouvrir la mise à niveau.",
      );
    } finally {
      setIsUpgrading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!activeSubscription?.planId) {
      return;
    }

    try {
      setIsCancelling(true);
      await updateSubscription({
        planId: activeSubscription.planId,
        cancelAction: "cancel_end_of_cycle",
      });
      toast.success("Abonnement annulé en fin de période.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'annuler l'abonnement.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (!customer) {
    return (
      <Panel>
        <div className="flex min-h-56 items-center justify-center">
          <LoaderCircle className="size-7 animate-spin text-slate-500" />
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <Crown className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Facturation
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Abonnement actuel.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Consultez l'état du plan et gérez la montée en gamme. Les
                détails de factures seront réintroduits dans une prochaine
                version.
              </p>
            </div>
          </div>

          <StatusPill tone={subscriptionStatus.tone}>
            {subscriptionStatus.label}
          </StatusPill>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <BillingMetric
            label="Plan"
            value={activeSubscription?.plan?.name ?? "Aucun plan actif"}
          />
          <BillingMetric
            label="Montant"
            value={
              activeSubscription?.plan?.price?.amount
                ? formatCurrency(activeSubscription.plan.price.amount * 100)
                : "Non facturé"
            }
          />
          <BillingMetric
            label="Prochaine échéance"
            value={
              activeSubscription?.currentPeriodEnd
                ? formatDate(activeSubscription.currentPeriodEnd)
                : "Non planifiée"
            }
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleUpgrade()}
            disabled={isUpgrading}
            className="h-10 active:scale-[0.98]"
          >
            {isUpgrading ? "Ouverture..." : "Mettre à niveau"}
            {isUpgrading ? (
              <LoaderCircle
                className="size-4 animate-spin"
                data-icon="inline-end"
              />
            ) : (
              <Sparkles className="size-4" data-icon="inline-end" />
            )}
          </Button>
          {activeSubscription ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCancelSubscription()}
              disabled={isCancelling}
              className="h-10 active:scale-[0.98]"
            >
              {isCancelling ? "Annulation..." : "Annuler en fin de période"}
              {isCancelling ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  data-icon="inline-end"
                />
              ) : null}
            </Button>
          ) : null}
        </div>
      </Panel>

      <Panel className="border-dashed">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-slate-950">
              Historique de facturation
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les factures et exports détaillés restent hors scope de cette V1.
              La section est prête à recevoir l'historique Autumn ensuite.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldBlock({
  children,
  className,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function OrganizationLogo({
  logo,
  name,
  size = "default",
}: {
  logo?: string | null;
  name?: string | null;
  size?: "default" | "lg";
}) {
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-900",
        size === "lg" ? "size-20" : "size-11",
      )}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          className="size-full object-cover"
          width={size === "lg" ? 80 : 44}
          height={size === "lg" ? 80 : 44}
        />
      ) : (
        <span className="grid gap-1 place-items-center">
          {size === "lg" ? <ImageIcon className="size-5" /> : null}
          {initials}
        </span>
      )}
    </div>
  );
}

function BillingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        tone === "neutral" && "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {tone === "success" ? <CheckCircle2 className="size-3.5" /> : null}
      {children}
    </span>
  );
}

function createOrganizationSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "organisation";
}

function getErrorText(errors: FieldErrorValue[]) {
  return errors
    .map((error) => (typeof error === "string" ? error : error?.message))
    .filter(Boolean)
    .join(", ");
}

function getInitials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "BO"
  );
}

function formatCurrency(amountInCents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}

function formatDate(value: number | string | Date) {
  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSubscriptionStatus(
  subscription:
    | NonNullable<
        ReturnType<typeof useCustomer>["data"]
      >["subscriptions"][number]
    | undefined,
): {
  label: string;
  tone: "neutral" | "success" | "warning" | "danger";
} {
  if (!subscription) {
    return { label: "Aucun abonnement", tone: "neutral" };
  }

  if (subscription.pastDue) {
    return { label: "En retard", tone: "danger" };
  }

  if (subscription.canceledAt != null) {
    return { label: "Annulé", tone: "danger" };
  }

  if (
    subscription.trialEndsAt != null &&
    subscription.trialEndsAt > Date.now()
  ) {
    return { label: "Essai", tone: "warning" };
  }

  if (subscription.status === "active") {
    return { label: "Actif", tone: "success" };
  }

  return { label: subscription.status, tone: "neutral" };
}
