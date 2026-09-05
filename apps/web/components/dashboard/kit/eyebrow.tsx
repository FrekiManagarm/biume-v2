type EyebrowProps = {
  children: string;
};

/**
 * Le kicker au-dessus d'un titre — partagé par `PageHeader` et
 * `SectionHeader` pour que les deux ne dérivent pas séparément.
 *
 * En ton neutre, pas violet : `tone.ts` réserve le violet à l'action qui fait
 * avancer le praticien. Un intitulé de section (« Rendez-vous à traiter »,
 * « Historique ») est une étiquette taxonomique, ni une action ni un état
 * atteint — le peindre en violet ferait dire à cette couleur deux choses à la
 * fois et diluerait le signal que la règle protège. L'aspect « kicker » de la
 * page de référence (`select-organization`) est gardé par la typographie —
 * petit, en gras, en capitales — plutôt que par la couleur.
 */
export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}
