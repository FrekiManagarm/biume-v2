import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { CaptureListScreen } from '@/screens/capture-list-screen';
import type { CaptureAction } from '@/capture/capture-list-view';
import { useAppState } from '@/app-state/app-state';
import { useWorkspacePorts } from '@/app-state/workspace-ports';
import { useCaptureWorkspace } from '@/app-state/capture-workspace';

const confirmationMessages: Partial<Record<CaptureAction, string>> = {
  delete: 'Supprimer définitivement cette dictée ?',
  redo: 'Remplacer cette dictée par un nouvel enregistrement ?',
};

export default function CapturesRoute() {
  const router = useRouter();
  const { organizationId } = useAppState();
  const ports = useWorkspacePorts(organizationId ?? '');
  const { rows, reload } = useCaptureWorkspace(ports);

  return (
    <CaptureListScreen
      onAction={(captureId, action) => {
        void ports
          .runCaptureAction(captureId, action, {
            openSignIn: () => router.push('/(auth)/sign-in'),
            restartRecording: (context) =>
              router.replace({
                pathname: '/(app)/record',
                params: context.appointmentId
                  ? { appointmentId: context.appointmentId }
                  : {},
              }),
          })
          .then(reload);
      }}
      onConfirm={(action) =>
        new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirmation',
            confirmationMessages[action] ?? 'Confirmer cette action ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Confirmer', onPress: () => resolve(true) },
            ],
          );
        })
      }
      rows={rows}
    />
  );
}
