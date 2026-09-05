// Le shell TanStack (`routes/__root.tsx`) importe encore la feuille de style
// par la syntaxe `?url` de Vite. Les déclarations ambiantes correspondantes
// venaient de `vite/client`, retiré du tsconfig au profit de Next, puis
// réintroduites par ricochet par `vite.config.ts` jusqu'à sa suppression.
// Cette déclaration couvre la seule occurrence restante du dépôt, le temps
// que le lot E supprime `routes/`.
declare module "*.css?url" {
  const url: string;
  export default url;
}
