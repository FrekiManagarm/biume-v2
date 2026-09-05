import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordView } from "./reset-password-view";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Biume",
  description: "Choisissez un nouveau mot de passe pour votre compte Biume.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
