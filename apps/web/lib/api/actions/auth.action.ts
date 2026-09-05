export { getCurrentOrganization } from "#/functions/auth.function";

// La mutation est une Server Action ; la réexporter d'ici garde le contrat
// que les composants consomment déjà (voir clients.action.ts).
export { switchActiveOrganization } from "./auth.mutations";
