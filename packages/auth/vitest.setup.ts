/**
 * `@biume/env/server` valide dix-huit variables au moment de l'import, et
 * `createAuth()` en dépend transitivement. Sans ce fichier, tout test qui
 * touche à `src/index.ts` échoue à la collecte, avant même sa première
 * assertion — c'est pour cette raison que le seul test existant du paquet
 * portait sur une fonction pure isolée.
 *
 * Les valeurs sont volontairement fausses et reconnaissables. Rien ici ne doit
 * ressembler à un secret : aucun test de ce paquet ne joint un service réel.
 * Le client Neon est créé en HTTP et ne se connecte pas à l'instanciation, donc
 * une URL de forme valide suffit.
 */
const fakeEnvironment: Record<string, string> = {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  BETTER_AUTH_SECRET: "secret-de-test-sans-valeur",
  BETTER_AUTH_URL: "http://localhost:3000",
  CORS_ORIGIN: "http://localhost:3000",
  AUTUMN_SECRET_KEY: "cle-de-test-sans-valeur",
  OPENAI_API_KEY: "cle-de-test-sans-valeur",
  RESEND_API_KEY: "cle-de-test-sans-valeur",
  APP_URL: "http://localhost:3000",
  ENCRYPTION_KEY: "cle-de-test-sans-valeur",
  GOOGLE_CLIENT_ID: "client-de-test",
  GOOGLE_CLIENT_SECRET: "secret-de-test-sans-valeur",
  UPLOADTHING_TOKEN: "jeton-de-test-sans-valeur",
  R2_ACCOUNT_ID: "compte-de-test",
  R2_ACCESS_KEY_ID: "cle-de-test",
  R2_SECRET_ACCESS_KEY: "secret-de-test-sans-valeur",
  R2_AUDIO_BUCKET: "bucket-de-test",
  MOBILE_TRUSTED_ORIGINS: "biume://",
  NODE_ENV: "test",
};

for (const [name, value] of Object.entries(fakeEnvironment)) {
  // Une valeur déjà posée par l'environnement l'emporte : lancer les tests
  // contre une base locale réelle reste possible sans toucher à ce fichier.
  process.env[name] ??= value;
}
