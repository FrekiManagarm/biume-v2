import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  LoaderCircle,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { getOrganizations, getSession } from "#/functions/auth.function";
import { organization as organizationClient, signOut } from "#/lib/auth-client";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/select-organization")({
  head: () => ({
    meta: [
      { title: "Choisir une organisation | Biume" },
      {
        name: "description",
        content:
          "Selectionnez l'organisation Biume a ouvrir pour cette session.",
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    const organizations = await getOrganizations();

    return { session, organizations };
  },
  component: SelectOrganization,
});

function SelectOrganization() {
  const navigate = useNavigate();
  const { session, organizations } = Route.useRouteContext();
  const activeOrganizationId = session.session.activeOrganizationId;
  const [pendingOrganizationId, setPendingOrganizationId] = useState<
    string | null
  >(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectOrganization(organizationId: string) {
    setError(null);
    setPendingOrganizationId(organizationId);

    const result = await organizationClient.setActive({
      organizationId,
    });

    if (result.error) {
      setError(
        result.error.message ||
          "Impossible d'ouvrir cette organisation pour le moment.",
      );
      setPendingOrganizationId(null);
      return;
    }

    await navigate({ to: "/dashboard/owners" });
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    await navigate({ to: "/signin" });
  }

  return (
    <main className="min-h-[100dvh] bg-[#f9fafb] text-slate-950">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-7xl grid-cols-1 px-4 py-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:px-8 lg:px-10">
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
                <ShieldCheck className="size-3.5 text-emerald-700" />
                Session sécurisée
              </div>
              <h1 className="text-4xl font-semibold leading-none tracking-tight text-slate-950 md:text-6xl">
                Choisissez l'espace à ouvrir.
              </h1>
              <p className="mt-5 max-w-[30rem] text-base leading-7 text-slate-600">
                Chaque organisation possède ses propriétaires, rapports et
                paramètres. Sélectionnez le bon espace avant d'entrer dans le
                dashboard.
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
          <div className="w-full">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  {organizations.length > 0
                    ? "Organisations disponibles"
                    : "Aucun espace disponible"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {organizations.length > 0
                    ? "Où voulez-vous travailler ?"
                    : "Créez votre premier espace."}
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={isSigningOut || pendingOrganizationId !== null}
                  onClick={handleSignOut}
                  type="button"
                  variant="outline"
                  className="h-10 justify-start active:scale-[0.98] sm:justify-center"
                >
                  Déconnexion
                  {isSigningOut ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      data-icon="inline-end"
                      aria-hidden="true"
                    />
                  ) : (
                    <LogOut
                      className="size-4"
                      data-icon="inline-end"
                      aria-hidden="true"
                    />
                  )}
                </Button>
                {organizations.length > 0 ? (
                  <Button
                    asChild
                    className="h-10 justify-start active:scale-[0.98] sm:justify-center"
                  >
                    <Link to="/create-organization">
                      Créer une organisation
                      <Plus
                        className="size-4"
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            {error ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {organizations.length > 0 ? (
              <div className="divide-y divide-slate-200 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)]">
                {organizations.map((organization, index) => {
                  const isActive = activeOrganizationId === organization.id;
                  const isPending = pendingOrganizationId === organization.id;

                  return (
                    <button
                      key={organization.id}
                      type="button"
                      disabled={pendingOrganizationId !== null || isSigningOut}
                      onClick={() => handleSelectOrganization(organization.id)}
                      className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 text-left transition duration-300 ease-out hover:bg-slate-50 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:px-5"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <span
                        className={cn(
                          "flex size-12 items-center justify-center overflow-hidden rounded-xl border transition duration-300",
                          isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-slate-300",
                        )}
                      >
                        {organization.logo ? (
                          <img
                            src={organization.logo}
                            alt=""
                            className="size-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <Building2 className="size-5" aria-hidden="true" />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-950 sm:text-base">
                            {organization.name}
                          </span>
                          {isActive ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              <Check className="size-3" aria-hidden="true" />
                              Active
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block truncate text-sm text-slate-500">
                          {organization.slug
                            ? `${organization.slug}.biume`
                            : "Compte professionnel Biume"}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition duration-300 group-hover:-translate-y-[1px] group-hover:text-slate-950",
                          isActive && "border-emerald-200 text-emerald-800",
                        )}
                      >
                        {isPending ? (
                          <LoaderCircle
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowRight className="size-4" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-10 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Building2 className="size-5" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                  Aucune organisation rattachée
                </h2>
                <p className="mt-2 max-w-[34rem] text-sm leading-6 text-slate-600">
                  Ce compte n'a pas encore accès à une organisation. Créez un
                  espace professionnel maintenant, ou demandez une invitation à
                  un administrateur si vous devez rejoindre une structure
                  existante.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-10 active:scale-[0.98]">
                    <Link to="/create-organization">
                      Créer ma première organisation
                      <Plus
                        className="size-4"
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  <Button
                    disabled={isSigningOut}
                    onClick={handleSignOut}
                    type="button"
                    variant="outline"
                    className="h-10 active:scale-[0.98]"
                  >
                    Retour à la connexion
                    {isSigningOut ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    ) : (
                      <LogOut
                        className="size-4"
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
