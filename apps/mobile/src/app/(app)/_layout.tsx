import { Redirect, Stack } from 'expo-router';
import { useAppState } from '@/app-state/app-state';

export default function AppLayout() {
  const { phase } = useAppState();
  if (phase === 'signed-out') return <Redirect href="/(auth)/sign-in" />;
  if (phase === 'no-organization') {
    return <Redirect href="/(auth)/select-organization" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
