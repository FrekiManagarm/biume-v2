# Prototype de landing : After dark uniquement

## Objectif

Conserver `/after-dark` comme unique prototype de landing immersif et supprimer entièrement la variante claire `/laboratoire`.

## Périmètre

- Supprimer la route `/laboratoire` sans redirection : elle doit revenir à la 404 standard de Next.js.
- Supprimer `LaboratoireLanding` et toute logique ou contenu exclusivement destiné au thème clair.
- Supprimer les deux images runtime dédiées à Laboratoire : `laboratoire-hero.webp` et `laboratoire-followup.webp`.
- Réduire les composants prototypes partagés à la seule variante `night` lorsque la branche claire n’a plus aucun consommateur.
- Préserver sans changement fonctionnel la route `/after-dark`, ses sept ancres SaaS, ses CTAs, ses informations tarifaires, son FAQ natif et ses animations immersives.

## Architecture

`AfterDarkLanding` reste la seule exportation de landing depuis `prototype-landings.tsx`. Les composants de contenu et de mouvement n’acceptent plus de variante claire si elle n’est plus utilisée ; leurs types et classes reflètent uniquement l’univers nocturne.

Les données SaaS factuelles restent centralisées. Les deux images restantes, `after-dark-hero.webp` et `after-dark-report-detail.webp`, continuent d’être les seuls médias runtime du prototype.

## Cas limites et vérification

Le retrait de la route repose sur la convention App Router : l’absence du dossier `app/laboratoire` produit une 404 sans middleware ni redirection supplémentaire. Les liens internes ne doivent plus référencer cette route.

La vérification couvre les tests prototypes adaptés au thème unique, le lint, le build marketing (qui doit lister `/after-dark` sans `/laboratoire`), et un contrôle navigateur desktop/mobile de la route restante.
