import type { Metadata } from "next";

import { SignUpView } from "./signup-view";

export const metadata: Metadata = {
  title: "Creation de compte | Biume",
  description: "Creez votre compte Biume pour gerer vos operations.",
};

export default function Page() {
  return <SignUpView />;
}
