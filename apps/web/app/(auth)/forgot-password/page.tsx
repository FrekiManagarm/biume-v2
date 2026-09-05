import type { Metadata } from "next";

import { ForgotPasswordView } from "./forgot-password-view";

export const metadata: Metadata = {
  title: "Mot de passe oublie | Biume",
  description: "Recevez un lien de reinitialisation pour votre compte Biume.",
};

export default function Page() {
  return <ForgotPasswordView />;
}
