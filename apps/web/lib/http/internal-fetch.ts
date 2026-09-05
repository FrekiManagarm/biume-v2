/**
 * Client des route handlers de `app/api/internal/*`.
 *
 * Ces endpoints servent le cache client de cette application et n'ont pas de
 * consommateur externe, contrairement à `/api/mobile/v1` et `/api/owner/v1`.
 *
 * `credentials: "include"` est indispensable : la session vit dans un cookie
 * et le handler résout l'organisation à partir de lui. Sans ce réglage, toute
 * lecture répondrait 401.
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
    throw new Error(`Lecture ${path} : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
