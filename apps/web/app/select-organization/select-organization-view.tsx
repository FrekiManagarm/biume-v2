"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  LoaderCircle,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import {
  EmptyState,
  GroupedList,
  GroupedListRow,
  SectionHeader,
  StatusPill,
} from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import type { getOrganizations, getSession } from "#/functions/auth.function";
import { switchActiveOrganization } from "#/lib/api/actions/auth.action";
import { signOut } from "#/lib/auth-client";

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
type Organizations = Awaited<ReturnType<typeof getOrganizations>>;

interface SelectOrganizationViewProps {
  session: Session;
  organizations: Organizations;
}

/**
 * Démo d'inscription, sous le texte de la colonne de gauche.
 *
 * `preload="none"` est délibéré : le fichier pèse 19,7 Mo, et cette page est
 * un simple aiguillage que la plupart des utilisateurs traversent sans
 * s'arrêter. Seul le poster (47 Ko) part au chargement ; la vidéo n'est
 * téléchargée qu'au clic sur lecture.
 *
 * Masquée sous `md` : sur mobile la colonne s'empile au-dessus de la liste
 * des entreprises, et la vidéo repousserait hors écran l'action principale
 * de la page — comme la ligne « Connecté en tant que » juste en dessous, qui
 * suit déjà cette règle.
 */
function IntroVideo() {
  return (
    <figure className="mt-10 hidden md:block">
      <video
        className="w-full rounded-xl border border-border bg-card shadow-sm"
        controls
        preload="none"
        playsInline
        poster="/assets/images/biume-inscription-poster.jpg"
        width={1584}
        height={1080}
      >
        <source src="/assets/biume-inscription.mp4" type="video/mp4" />
        Votre navigateur ne peut pas lire cette vidéo.
      </video>
      <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
        Découvrir Biume en vidéo — création de compte et premiers pas
        (1&nbsp;min, sous-titrée).
      </figcaption>
    </figure>
  );
}

export function SelectOrganizationView({
  session,
  organizations,
}: SelectOrganizationViewProps) {
  const router = useRouter();
  const activeOrganizationId = session.session.activeOrganizationId;
  const [pendingOrganizationId, setPendingOrganizationId] = useState<
    string | null
  >(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectOrganization(organizationId: string) {
    setError(null);
    setPendingOrganizationId(organizationId);

    let result: Awaited<ReturnType<typeof switchActiveOrganization>>;

    // Le contrat ActionResult ne rejette plus pour une erreur applicative
    // (elle résout en { success: false }, déballée ci-dessous), mais un échec
    // de transport (réseau coupé, serveur injoignable) rejette toujours la
    // promesse avant même d'atteindre ce contrat — d'où ce filet, voir
    // create-organization-view.tsx.
    try {
      result = await switchActiveOrganization({
        organizationId,
      });
    } catch (switchError) {
      setError(
        switchError instanceof Error
          ? switchError.message
          : "Impossible d'ouvrir cette entreprise pour le moment.",
      );
      setPendingOrganizationId(null);
      return;
    }

    if (!result.success) {
      setError(result.error);
      setPendingOrganizationId(null);
      return;
    }

    window.location.replace("/dashboard");
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 px-4 py-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:px-8 lg:px-10">
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
                <StatusPill icon={ShieldCheck} tone="done">
                  Session sécurisée
                </StatusPill>
              </div>
              <h1 className="text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
                Choisissez l'espace à ouvrir.
              </h1>
              <p className="mt-5 max-w-120 text-base leading-7 text-ink-muted">
                Chaque entreprise possède ses propriétaires, rapports et
                paramètres. Sélectionnez le bon espace avant d'entrer dans le
                dashboard.
              </p>

              <IntroVideo />
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
          <div className="w-full">
            <SectionHeader
              eyebrow={
                organizations.length > 0
                  ? "Entreprises disponibles"
                  : "Aucun espace disponible"
              }
              title={
                organizations.length > 0
                  ? "Où voulez-vous travailler ?"
                  : "Créez votre premier espace."
              }
              actions={
                <>
                  <Button
                    disabled={isSigningOut || pendingOrganizationId !== null}
                    onClick={handleSignOut}
                    type="button"
                    variant="outline"
                    className="h-10 active:scale-[0.98]"
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
                    <Button asChild className="h-10 active:scale-[0.98]">
                      <Link href="/create-organization">
                        Créer une entreprise
                        <Plus
                          className="size-4"
                          data-icon="inline-end"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  ) : null}
                </>
              }
            />

            {error ? (
              <div
                className="mb-4 rounded-lg border border-destructive-border bg-destructive-surface px-4 py-3 text-sm leading-6 text-destructive"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {organizations.length > 0 ? (
              <GroupedList>
                {organizations.map((organization) => {
                  const isActive = activeOrganizationId === organization.id;
                  const isPending = pendingOrganizationId === organization.id;

                  return (
                    <GroupedListRow
                      key={organization.id}
                      icon={organization.logo ? undefined : Building2}
                      iconContent={
                        organization.logo ? (
                          <img
                            src={organization.logo}
                            alt=""
                            className="size-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : undefined
                      }
                      iconTone={isActive ? "done" : "neutral"}
                      title={organization.name}
                      meta={
                        organization.slug
                          ? `${organization.slug}.biume`
                          : "Compte professionnel Biume"
                      }
                      badge={
                        isActive ? (
                          <StatusPill icon={Check} tone="done">
                            Active
                          </StatusPill>
                        ) : undefined
                      }
                      statusLabel={isActive ? "Active" : undefined}
                      trailing={
                        isPending ? (
                          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                            <LoaderCircle
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          </span>
                        ) : undefined
                      }
                      disabled={pendingOrganizationId !== null || isSigningOut}
                      onSelect={() => handleSelectOrganization(organization.id)}
                    />
                  );
                })}
              </GroupedList>
            ) : (
              <EmptyState
                icon={Building2}
                title="Aucune entreprise rattachée"
                description="Ce compte n'a pas encore accès à une entreprise. Créez un espace professionnel maintenant, ou demandez une invitation à un administrateur si vous devez rejoindre une structure existante."
                action={
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="h-10 active:scale-[0.98]">
                      <Link href="/create-organization">
                        Créer ma première entreprise
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
                }
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
