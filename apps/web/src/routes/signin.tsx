import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AuthField,
  AuthForm,
  AuthMessage,
  AuthPanel,
  AuthShell,
  SubmitButton,
} from "#/components/auth/auth-layout";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/signin")({
  ssr: false,
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard/owners",
    });

    setIsPending(false);

    if (signInError) {
      setError(signInError.message || "Connexion impossible.");
      return;
    }

    void navigate({ to: "/dashboard/owners" });
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGooglePending(true);

    const { error: signInError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/owners",
    });

    setIsGooglePending(false);

    if (signInError) {
      setError(signInError.message || "Connexion Google impossible.");
    }
  }

  return (
    <AuthShell>
      <AuthPanel
        title="Connexion"
        description="Renseignez vos identifiants pour rejoindre votre espace Biume."
        footer={
          <>
            Pas encore de compte ?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/signup"
            >
              Créer un compte
            </Link>
          </>
        }
      >
        <div className="grid gap-4">
          <Button
            className="h-10 w-full"
            disabled={isGooglePending || isPending}
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
          >
            Continuer avec Google
            <LoaderCircle
              className={isGooglePending ? "size-4 animate-spin" : "hidden"}
              data-icon="inline-end"
              aria-hidden="true"
            />
          </Button>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px bg-border" />
            ou
            <span className="h-px bg-border" />
          </div>

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
            <div className="grid gap-2">
              <AuthField
                autoComplete="current-password"
                icon={LockKeyhole}
                id="password"
                label="Mot de passe"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                required
                type="password"
                value={password}
              />
              <Link
                className="justify-self-end text-sm font-medium text-primary hover:underline"
                to="/forgot-password"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {error ? <AuthMessage>{error}</AuthMessage> : null}

            <SubmitButton
              icon={isPending ? LoaderCircle : ArrowRight}
              isPending={isPending}
            >
              Se connecter
            </SubmitButton>
          </AuthForm>
        </div>
      </AuthPanel>
    </AuthShell>
  );
}
