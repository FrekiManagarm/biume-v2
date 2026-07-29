/**
 * Le logotype est dessiné en code, pas importé.
 *
 * Le repère à gauche porte les trois couleurs de Biume dans l'ordre
 * du parcours — violet, bleu, vert : on décide, on relie, on confirme.
 * C'est la même grammaire que le reste de la page, réduite à trois
 * pixels de haut.
 */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 text-[color:var(--lv4-text)]">
      <span aria-hidden="true" className="flex flex-col gap-[2px]">
        <span className="block h-[3px] w-3.5 bg-[color:var(--lv4-violet)]" />
        <span className="block h-[3px] w-3.5 bg-[color:var(--lv4-blue)]" />
        <span className="block h-[3px] w-3.5 bg-[color:var(--lv4-green)]" />
      </span>
      <span className="text-[1.15rem] font-semibold tracking-[-0.045em]">
        Biume
      </span>
    </span>
  );
}
