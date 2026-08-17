/**
 * Le kit du dashboard.
 *
 * Avant lui, chaque page redéfinissait son propre `Panel`, sa propre carte de
 * métrique et sa propre pastille d'état, en couleurs codées en dur. C'est ce
 * qui rendait le produit incohérent d'une page à l'autre et l'empêchait de
 * suivre un thème. Toute page du dashboard doit passer par ces primitives.
 */
export { EmptyState } from "./empty-state";
export { ListRow } from "./list-row";
export { Metric } from "./metric";
export { PageHeader } from "./page-header";
export { Panel, PanelHeader } from "./panel";
export { StatusPill } from "./status-pill";
export { toneIconClassName, toneSoftClassName, type Tone } from "./tone";
