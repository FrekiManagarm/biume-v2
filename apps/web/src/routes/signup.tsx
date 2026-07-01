import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
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

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Creation de compte | Biume" },
      {
        name: "description",
        content: "Creez votre compte Biume pour gerer vos operations.",
      },
    ],
  }),
  ssr: false,
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/select-organization",
    });

    setIsPending(false);

    if (signUpError) {
      setError(signUpError.message || "Création du compte impossible.");
      return;
    }

    void navigate({ to: "/select-organization" });
  }

  async function handleGoogleSignUp() {
    setError(null);
    setIsGooglePending(true);

    const { error: signUpError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/select-organization",
    });

    setIsGooglePending(false);

    if (signUpError) {
      setError(signUpError.message || "Inscription Google impossible.");
    }
  }

  return (
    <AuthShell>
      <AuthPanel
        title="Création de compte"
        description="Ouvrez votre espace Biume et commencez à structurer vos opérations."
        footer={
          <>
            Déjà inscrit ?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/signin"
            >
              Se connecter
            </Link>
          </>
        }
      >
        <div className="grid gap-4">
          <Button
            className="h-10 w-full"
            disabled={isGooglePending || isPending}
            onClick={handleGoogleSignUp}
            type="button"
            variant="outline"
          >
            S'inscrire avec Google
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
              autoComplete="name"
              icon={User}
              id="name"
              label="Nom"
              onChange={(event) => setName(event.target.value)}
              placeholder="Mathieu Chambaud"
              required
              type="text"
              value={name}
            />
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
            <AuthField
              autoComplete="new-password"
              hint="Minimum 8 caractères."
              icon={LockKeyhole}
              id="password"
              label="Mot de passe"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choisissez un mot de passe"
              required
              type="password"
              value={password}
            />

            {error ? <AuthMessage>{error}</AuthMessage> : null}

            <SubmitButton
              icon={isPending ? LoaderCircle : ArrowRight}
              isPending={isPending}
            >
              Créer le compte
            </SubmitButton>
          </AuthForm>
        </div>
      </AuthPanel>
    </AuthShell>
  );
}
