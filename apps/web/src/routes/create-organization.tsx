import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { FileDropzone, formatFileRejection } from "#/components/file-dropzone";
import {
  IconTile,
  SectionHeader,
  StatusPill,
} from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getSession } from "#/functions/auth.function";
import { organization as organizationClient } from "#/lib/auth-client";
import { startOrganizationTrialFn } from "#/lib/api/actions/trial.action";
import { useUploadThing } from "#/lib/utils/uploadthing";

export function createOrganizationSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "entreprise";
}

export const Route = createFileRoute("/create-organization")({
  head: () => ({
    meta: [
      { title: "Créer une entreprise | Biume" },
      {
        name: "description",
        content: "Creez une nouvelle entreprise Biume.",
      },
    ],
  }),
  ssr: true,
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    return { session };
  },
  component: CreateOrganization,
});

function CreateOrganization() {
  const { session } = Route.useRouteContext();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoFile, setLogoFile] = useState<File[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { startUpload, isUploading: isLogoUploading } = useUploadThing(
    "organizationLogoUploader",
    {
      onUploadProgress: setLogoUploadProgress,
    },
  );

  const effectiveSlug = useMemo(
    () => createOrganizationSlug(hasEditedSlug ? slug : name),
    [hasEditedSlug, name, slug],
  );

  function handleNameChange(value: string) {
    setName(value);

    if (!hasEditedSlug) {
      setSlug(createOrganizationSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setHasEditedSlug(true);
    setSlug(createOrganizationSlug(value));
  }

  async function handleLogoFilesChange(files: File[]) {
    setLogoFile(files);
    setLogoUrl("");
    setLogoUploadProgress(0);
    setError(null);

    const [file] = files;

    if (!file) {
      return;
    }

    try {
      const uploadedFiles = await startUpload([file]);
      const uploadedFile = uploadedFiles?.[0];
      const uploadedUrl = uploadedFile?.ufsUrl || uploadedFile?.url;

      if (!uploadedUrl) {
        setError("Impossible de récupérer l'URL du logo importé.");
        return;
      }

      setLogoUrl(uploadedUrl);
      setLogoUploadProgress(100);
    } catch (uploadError) {
      setLogoFile([]);
      setLogoUrl("");
      setLogoUploadProgress(0);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible d'importer ce logo pour le moment.",
      );
    }
  }

  function clearLogo() {
    setLogoFile([]);
    setLogoUrl("");
    setLogoUploadProgress(0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const organizationName = name.trim();
    const organizationSlug = effectiveSlug;

    if (!organizationName) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }

    if (isLogoUploading) {
      setError("Veuillez attendre la fin de l'import du logo.");
      return;
    }

    if (logoFile.length > 0 && !logoUrl) {
      setError("Le logo n'a pas encore été importé.");
      return;
    }

    setIsPending(true);

    const result = await organizationClient.create({
      name: organizationName,
      slug: organizationSlug,
      logo: logoUrl || undefined,
    });

    if (result.error) {
      setError(
        result.error.message ||
          "Impossible de créer cette entreprise pour le moment.",
      );
      setIsPending(false);
      return;
    }

    // Best-effort : un échec ne doit pas empêcher l'accès à l'organisation
    // fraîchement créée, le paywall du dashboard rattrape sinon.
    await startOrganizationTrialFn({
      data: {
        organizationId: result.data.id,
        organizationName: result.data.name,
      },
    }).catch(() => {});

    window.location.replace("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 px-4 py-8 md:grid-cols-[0.75fr_1.25fr] md:gap-12 md:px-8 lg:px-10">
        <section className="flex flex-col justify-between border-b border-border pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-10">
          <div>
            <div className="inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-tight">
              <img
                src="/assets/images/biume-logo.png"
                alt=""
                className="size-9 rounded-lg"
                width={36}
                height={36}
              />
              Biume
            </div>

            <div className="mt-14 max-w-136 md:mt-24">
              <div className="mb-5 inline-flex">
                <StatusPill icon={Sparkles} tone="done">
                  Nouvel espace
                </StatusPill>
              </div>
              <h1 className="text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
                Créez votre entreprise.
              </h1>
              <p className="mt-5 max-w-120 text-base leading-7 text-ink-muted">
                Ajoutez un espace professionnel pour isoler les propriétaires,
                rapports et paramètres de cette activité.
              </p>
            </div>
          </div>

          <div className="mt-10 hidden text-sm text-muted-foreground md:block">
            Connecté en tant que{" "}
            <span className="font-medium text-foreground">
              {session.user.email}
            </span>
          </div>
        </section>

        <section className="flex items-center py-8 md:py-12">
          <div className="w-full max-w-155">
            <Button
              asChild
              variant="ghost"
              className="mb-6 h-10 px-0 text-ink-muted hover:bg-transparent hover:text-foreground"
            >
              <Link to="/select-organization">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Retour aux entreprises
              </Link>
            </Button>

            <SectionHeader
              eyebrow="Identité de l'entreprise"
              title="Renseignez les informations principales."
            />

            <p className="mb-2 text-xs leading-5 text-muted-foreground">
              <span className="font-medium text-destructive">*</span> Champs
              obligatoires
            </p>

            <form
              onSubmit={handleSubmit}
              className="rounded-card border border-border bg-card p-5 sm:p-6"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="organization-name" className="gap-1">
                    Nom de l'entreprise
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </Label>
                  <Input
                    id="organization-name"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Clinique Vétérinaire Les Alizés"
                    required
                    className="h-11"
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Ce nom sera visible dans le sélecteur et la barre latérale.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization-slug" className="gap-1">
                    Slug
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 sm:grid-cols-[1fr_auto]">
                    <Input
                      id="organization-slug"
                      value={effectiveSlug}
                      onChange={(event) => handleSlugChange(event.target.value)}
                      required
                      className="h-11 border-0 shadow-none focus-visible:ring-0"
                    />
                    <span className="flex items-center border-t border-border px-3 py-2 text-sm text-muted-foreground sm:border-l sm:border-t-0">
                      .biume
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Le slug doit être unique. Il est généré depuis le nom, mais
                    vous pouvez l'ajuster.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization-logo">Logo optionnel</Label>
                  <FileDropzone
                    accept={{
                      "image/jpeg": [".jpg", ".jpeg"],
                      "image/png": [".png"],
                      "image/webp": [".webp"],
                      "image/svg+xml": [".svg"],
                    }}
                    description="PNG, JPG, WebP ou SVG. Taille maximale: 2 MB."
                    disabled={isLogoUploading || isPending}
                    files={logoFile}
                    id="organization-logo"
                    maxFiles={1}
                    maxSize={2 * 1024 * 1024}
                    onFilesChange={handleLogoFilesChange}
                    onRejected={(rejections) => {
                      setError(rejections.map(formatFileRejection).join(" "));
                    }}
                    title={
                      isLogoUploading
                        ? `Import en cours (${logoUploadProgress}%)`
                        : "Importer le logo"
                    }
                  />

                  {logoUrl ? (
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-success-border bg-success-surface px-3 py-2 text-sm text-success">
                      <img
                        alt=""
                        className="size-10 rounded-md border border-success-border bg-card object-cover"
                        src={logoUrl}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Logo importé
                        </p>
                        <p className="truncate text-xs text-success">
                          {logoUrl}
                        </p>
                      </div>
                      <Button
                        aria-label="Retirer le logo"
                        disabled={isPending}
                        onClick={clearLogo}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <div
                    className="rounded-lg border border-destructive-border bg-destructive-surface px-4 py-3 text-sm leading-6 text-destructive"
                    role="alert"
                  >
                    {error}
                  </div>
                ) : null}

                <Button
                  disabled={isPending || isLogoUploading}
                  type="submit"
                  className="h-11 w-full active:scale-[0.98]"
                >
                  {isLogoUploading ? "Import du logo..." : "Créer l'entreprise"}
                  {isPending || isLogoUploading ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      data-icon="inline-end"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight
                      className="size-4"
                      data-icon="inline-end"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-5 grid grid-cols-[auto_1fr] items-start gap-3 rounded-card border border-border bg-card px-4 py-3 text-sm leading-6 text-ink-muted">
              <IconTile icon={Building2} tone="done" size="sm" />
              <p>
                Après création, cette entreprise devient l'espace actif de la
                session et vous serez redirigé vers le dashboard.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
