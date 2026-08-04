import { useRouter } from 'expo-router';
import { HomeScreen } from '@/screens/home-screen';
import { useWorkspacePorts } from '@/app-state/workspace-ports';
import { useCaptureWorkspace } from '@/app-state/capture-workspace';

export default function HomeRoute() {
  const router = useRouter();
  const ports = useWorkspacePorts();
  const { primary, upcoming, agendaFresh } = useCaptureWorkspace(ports);

  return (
    <HomeScreen
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
