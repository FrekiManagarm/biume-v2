import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({ component: SignIn });

function SignIn() {
  return <></>;
}
