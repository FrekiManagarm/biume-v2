import { useRouter } from 'expo-router';
import { HomeScreen } from '@/screens/home-screen';
import { useAppState } from '@/app-state/app-state';
import { useWorkspacePorts } from '@/app-state/workspace-ports';
import { useCaptureWorkspace } from '@/app-state/capture-workspace';

export default function HomeRoute() {
  const router = useRouter();
  const { organizationId } = useAppState();
  const ports = useWorkspacePorts(organizationId ?? '');
  const { primary, upcoming, agendaFresh } = useCaptureWorkspace(ports);

  return (
    <HomeScreen
      onOpenCaptures={() => router.push('/(app)/captures')}
      onStartCapture={(appointmentId) =>
        router.push({
          pathname: '/(app)/record',
          params: appointmentId ? { appointmentId } : {},
        })
      }
      online={agendaFresh}
      primary={primary}
      upcoming={upcoming}
    />
  );
}
