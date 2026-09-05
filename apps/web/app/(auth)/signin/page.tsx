import type { Metadata } from "next";

import { SignInView } from "./signin-view";

export const metadata: Metadata = {
  title: "Connexion | Biume",
  description: "Connectez-vous a votre espace Biume.",
};

export default function Page() {
  return <SignInView />;
}
