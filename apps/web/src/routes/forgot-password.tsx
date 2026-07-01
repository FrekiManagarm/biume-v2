import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from "lucide-react";
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

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublie | Biume" },
      {
        name: "description",
        content: "Recevez un lien de reinitialisation pour votre compte Biume.",
      },
    ],
  }),
  ssr: false,
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsPending(true);

    const { data, error: resetError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsPending(false);

    if (resetError) {
      setError(resetError.message || "Impossible d'envoyer le lien.");
      return;
    }

    setMessage(
      data?.message ||
        "Si un compte existe avec cet email, un lien de réinitialisation arrive.",
    );
  }

  return (
    <AuthShell>
      <AuthPanel
        title="Mot de passe oublié"
        description="Recevez un lien sécurisé pour choisir un nouveau mot de passe."
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
            autoComplete="email"
            icon={Mail}
            id="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@biume.fr"
            required
            type="email"
            value={email}
          />

          {error ? <AuthMessage>{error}</AuthMessage> : null}
          {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}

          <SubmitButton
            icon={isPending ? LoaderCircle : ArrowRight}
            isPending={isPending}
          >
            Envoyer le lien
          </SubmitButton>
        </AuthForm>
      </AuthPanel>
    </AuthShell>
  );
}
