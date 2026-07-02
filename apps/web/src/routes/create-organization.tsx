import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
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

import {
  FileDropzone,
  formatFileRejection,
} from "#/components/file-dropzone";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getSession } from "#/functions/auth.function";
import { organization as organizationClient } from "#/lib/auth-client";
import { useUploadThing } from "#/lib/utils/uploadthing";

export function createOrganizationSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "organisation";
}

export const Route = createFileRoute("/create-organization")({
  head: () => ({
    meta: [
      { title: "Créer une organisation | Biume" },
      {
        name: "description",
        content: "Creez une nouvelle organisation Biume.",
      },
    ],
  }),
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
  const navigate = useNavigate();
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
      setError("Le nom de l'organisation est requis.");
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
          "Impossible de créer cette organisation pour le moment.",
      );
      setIsPending(false);
      return;
    }

    await navigate({ to: "/dashboard/owners" });
  }

  return (
    <main className="min-h-[100dvh] bg-[#f9fafb] text-slate-950">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 px-4 py-8 md:grid-cols-[0.75fr_1.25fr] md:gap-12 md:px-8 lg:px-10">
        <section className="flex flex-col justify-between border-b border-slate-200 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-10">
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

            <div className="mt-14 max-w-[34rem] md:mt-24">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.45)]">
                <Sparkles className="size-3.5 text-emerald-700" />
                Nouvel espace
              </div>
              <h1 className="text-4xl font-semibold leading-none tracking-tight text-slate-950 md:text-6xl">
                Créez votre organisation.
              </h1>
              <p className="mt-5 max-w-[30rem] text-base leading-7 text-slate-600">
                Ajoutez un espace professionnel pour isoler les propriétaires,
                rapports et paramètres de cette activité.
              </p>
            </div>
          </div>

          <div className="mt-10 hidden text-sm text-slate-500 md:block">
            Connecté en tant que{" "}
            <span className="font-medium text-slate-800">
              {session.user.email}
            </span>
          </div>
        </section>

        <section className="flex items-center py-8 md:py-12">
          <div className="w-full max-w-[620px]">
            <Button
              asChild
              variant="ghost"
              className="mb-6 h-10 px-0 text-slate-600 hover:bg-transparent hover:text-slate-950"
            >
              <Link to="/select-organization">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Retour aux organisations
              </Link>
            </Button>

            <div className="mb-4">
              <p className="text-sm font-medium text-emerald-700">
                Identité de l'organisation
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Renseignez les informations principales.
              </h2>
            </div>

            <p className="mb-2 text-xs leading-5 text-slate-500">
              <span className="font-medium text-red-600">*</span> Champs
              obligatoires
            </p>

            <form
              onSubmit={handleSubmit}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="organization-name" className="gap-1">
                    Nom de l'organisation
                    <span className="text-red-600" aria-hidden="true">
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
                  <p className="text-xs leading-5 text-slate-500">
                    Ce nom sera visible dans le sélecteur et la barre latérale.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization-slug" className="gap-1">
                    Slug
                    <span className="text-red-600" aria-hidden="true">
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
                    <span className="flex items-center border-t border-slate-200 px-3 py-2 text-sm text-slate-500 sm:border-l sm:border-t-0">
                      .biume
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
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
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                      <img
                        alt=""
                        className="size-10 rounded-md border border-emerald-200 bg-white object-cover"
                        src={logoUrl}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2
                            className="size-4"
                            aria-hidden="true"
                          />
                          Logo importé
                        </p>
                        <p className="truncate text-xs text-emerald-700">
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
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
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
                  {isLogoUploading
                    ? "Import du logo..."
                    : "Créer l'organisation"}
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

            <div className="mt-5 grid grid-cols-[auto_1fr] gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                <Building2 className="size-4" aria-hidden="true" />
              </div>
              <p>
                Après création, cette organisation devient l'espace actif de la
                session et vous serez redirigé vers le dashboard.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
