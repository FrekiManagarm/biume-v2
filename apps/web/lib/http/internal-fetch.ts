/**
 * Client des route handlers de `app/api/internal/*`.
 *
 * Ces endpoints servent le cache client de cette application et n'ont pas de
 * consommateur externe, contrairement à `/api/mobile/v1` et `/api/owner/v1`.
 *
 * `credentials: "include"` est défensif plutôt qu'indispensable : sur une URL
 * relative same-origin, le défaut `same-origin` de `fetch` enverrait déjà le
 * cookie de session. On le fixe explicitement pour ne pas dépendre de ce
 * défaut si un jour un de ces appels traverse une origine différente.
 *
 * RÈGLE (revue finale du lot B) — `internalGet` (donc toute enveloppe de
 * `lib/api/actions/*.action.ts` qui l'appelle) est réservé au client. Il fait
 * un `fetch` sur une URL **relative** (`path` ci-dessous, ex. `/api/internal/
 * clients`) : cela ne résout que dans un navigateur, où une URL relative se
 * complète implicitement contre `location`. Appelé depuis un Server Component,
 * une route handler ou un job — où Node exécute ce `fetch` sans page ni
 * origine implicite — cela lève `TypeError: Failed to parse URL`.
 *
 * Une lecture serveur doit donc toujours importer la fonction directement
 * depuis `functions/*.function.ts` (ex. `getAllClients`), jamais l'enveloppe
 * `*.action.ts` qui l'entoure pour le client. C'est aussi le seul moyen
 * d'honorer le chemin « page RSC → fonction → Drizzle, aucun RPC » du § 5.3
 * de la spec : passer par `internalGet` introduirait précisément le
 * aller-retour HTTP que ce paragraphe interdit.
 *
 * Sans consommateur aujourd'hui (aucun fichier sous `app/`, `server/` ou
 * `trigger/` n'importe `lib/api/actions`), donc aucun risque immédiat — mais
 * le lot C écrira ses pages RSC contre cette règle.
 */
export class InternalFetchError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    statusText: string,
  ) {
    super(`Lecture ${path} : ${status} ${statusText}`);
    this.name = "InternalFetchError";
  }
}

const ISO_DATE_WITH_MILLISECONDS =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * `Response.json()` ne prend pas de reviver ; on repasse donc par `text()` +
 * `JSON.parse(text, reviver)`.
 *
 * `getAllClients` traverse maintenant `JSON.stringify` (fait par
 * `Response.json()` côté route handler) puis ce `fetch` côté client, alors
 * qu'avant cette tâche `createServerFn` de TanStack préservait les `Date` au
 * travers de la sérialisation. Sans ce reviver, chaque horodatage redevient
 * une chaîne côté appelant alors que son type déclaré dit `Date` — un
 * mensonge de typage que rien ne signale à l'exécution (voir le type
 * `ClientWithRelations` de `clients.action.ts`).
 *
 * Borné à la forme stricte que produit `Date.prototype.toJSON()`
 * (`AAAA-MM-JJTHH:mm:ss.sssZ`) et à rien d'autre : pas de reconnaissance de
 * date approximative. Compromis assumé : une chaîne saisie par un
 * utilisateur qui aurait exactement cette forme deviendrait une `Date`.
 * Dans un logiciel vétérinaire, aucun champ libre ne porte un horodatage ISO
 * à la milliseconde — le risque est nul en pratique.
 */
function reviveDates(_key: string, value: unknown): unknown {
  if (typeof value === "string" && ISO_DATE_WITH_MILLISECONDS.test(value)) {
    return new Date(value);
  }

  return value;
}

/**
 * Deux limites à connaître avant d'appeler ceci sur une nouvelle ressource :
 *
 * - `params` ne sait porter ni tableau ni `Date` — seulement
 *   `string | number | boolean | undefined`. Un paramètre de ce genre doit
 *   être sérialisé par l'appelant avant l'appel.
 * - La signature n'accepte `params` que parce que le type appelant
 *   (`GetAllClientsParams`, `z.infer<...>`) est un **alias de type** ; un
 *   alias d'objet se voit inférer une signature d'index compatible avec
 *   `Record<string, ...>`. Une ressource qui déclarerait ses paramètres par
 *   une `interface` échouerait à l'appel pour une raison très obscure : les
 *   `interface` ne portent pas cette signature d'index implicite.
 */
export async function internalGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  const response = await fetch(`${path}${query ? `?${query}` : ""}`, {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    // Le message porte le chemin : une erreur de lecture remonte jusqu'à un
    // toast dans l'interface, et « 500 » seul n'aide personne à diagnostiquer.
    // Le statut est aussi exposé en propriété : un appelant (le lot C, pour
    // rediriger sur 401 plutôt que réessayer) peut brancher sur
    // `error instanceof InternalFetchError` sans parser le message.
    throw new InternalFetchError(response.status, path, response.statusText);
  }

  const text = await response.text();
  return JSON.parse(text, reviveDates) as T;
}
