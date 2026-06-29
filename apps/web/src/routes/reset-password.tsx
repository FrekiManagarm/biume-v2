import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AuthField,
  AuthForm,
  AuthMessage,
  AuthPanel,
  AuthShell,
  SubmitButton,
} from "#/components/auth/auth-layout";
import { authClient } from "#/lib/auth-client";

type ResetPasswordSearch = {
  token?: string;
  error?: string;
};

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  validateSearch: (search): ResetPasswordSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { token, error: tokenError } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(
    tokenError ? "Le lien de réinitialisation est invalide ou expiré." : null,
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Le lien de réinitialisation est invalide ou expiré.");
      return;
    }

    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsPending(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setIsPending(false);

    if (resetError) {
      setError(resetError.message || "Impossible de modifier le mot de passe.");
      return;
    }

    void navigate({ to: "/signin" });
  }

  return (
    <AuthShell>
      <AuthPanel
        title="Nouveau mot de passe"
        description="Choisissez un mot de passe solide pour reprendre votre session."
        footer={
          <Link
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            to="/signin"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour à la connexion
          </Link>
        }
      >
        <AuthForm onSubmit={handleSubmit}>
          <AuthField
            autoComplete="new-password"
            hint="Minimum 8 caractères."
            icon={KeyRound}
            id="password"
            label="Nouveau mot de passe"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre nouveau mot de passe"
            required
            type="password"
            value={password}
          />
          <AuthField
            autoComplete="new-password"
            icon={KeyRound}
            id="confirmation"
            label="Confirmation"
            minLength={8}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Confirmez le mot de passe"
            required
            type="password"
            value={confirmation}
          />

          {error ? <AuthMessage>{error}</AuthMessage> : null}

          <SubmitButton
            icon={isPending ? LoaderCircle : ArrowRight}
            isPending={isPending}
          >
            Modifier le mot de passe
          </SubmitButton>
        </AuthForm>
      </AuthPanel>
    </AuthShell>
  );
}
