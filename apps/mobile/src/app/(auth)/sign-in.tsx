import { useAppState } from '@/app-state/app-state';
import { SignInScreen } from '@/screens/sign-in-screen';

export default function SignInRoute() {
  const { signIn, error, pending, online } = useAppState();
  return (
    <SignInScreen
      error={error}
      onSignIn={signIn}
      online={online}
      pending={pending}
    />
  );
}
