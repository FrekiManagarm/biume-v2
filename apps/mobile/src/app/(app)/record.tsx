import { useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useWorkspacePorts } from '@/app-state/workspace-ports';
import { openCaptureAudio, sealRecording } from '@/capture/capture-files';
import { createExpoCaptureFileAdapters } from '@/capture/expo-capture-files';
import type { LocalCapture } from '@/capture/local-capture';
import {
  biumeRecordingOptions,
  createExpoAudioRecorder,
} from '@/recording/expo-audio-recorder';
import { createRecordingSession } from '@/recording/recording-session';
import { createStorageGuard } from '@/recording/storage-guard';
import { RecordScreen } from '@/screens/record-screen';
import { ReviewScreen } from '@/screens/review-screen';

function toDataUri(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/mp4;base64,${globalThis.btoa(binary)}`;
}

export default function RecordRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appointmentId?: string }>();
  const ports = useWorkspacePorts();
  const recorder = useAudioRecorder(biumeRecordingOptions);

  const [phase, setPhase] = useState<'recording' | 'review'>('recording');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [microphoneReady, setMicrophoneReady] = useState(true);
  const [captured, setCaptured] = useState<LocalCapture | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ?? undefined);
  const startedRef = useRef(false);

  const adapters = useMemo(() => createExpoCaptureFileAdapters(), []);

  const session = useMemo(
    () =>
      createRecordingSession({
        recorder: createExpoAudioRecorder(recorder),
        storage: createStorageGuard(async () => Number.MAX_SAFE_INTEGER),
        seal: (input) => sealRecording(input, adapters),
        discardPlaintext: (uri) => adapters.fileSystem.deleteFile(uri),
        persistInterruptedSession: async () => {},
        clearInterruptedSession: async () => {},
        repository: ports.repository,
        newCaptureId: () => globalThis.crypto.randomUUID(),
        now: () => new Date(),
      }),
    [adapters, ports.repository, recorder],
  );

  const finish = useCallback(async () => {
    const outcome = await session.stop();

    if (outcome.status === 'review') {
      setCaptured(outcome.capture);
      const bytes = await openCaptureAudio(
        {
          captureId: outcome.capture.id,
          encryptedFileUri: outcome.capture.encryptedFileUri,
        },
        adapters,
      );
      // Decrypted into a data URI rather than a file: no second plaintext copy
      // ever touches the disk.
      setAudioUri(toDataUri(bytes));
      setPhase('review');
      return;
    }

    if (outcome.status === 'encryption_failed') {
      Alert.alert(
        'Chiffrement impossible',
        'La dictée est conservée et vous sera proposée à la récupération au prochain démarrage.',
      );
      router.back();
    }
  }, [adapters, router, session]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void session
      .start({
        appointmentId: params.appointmentId ?? null,
        patientId: null,
      })
      .then((outcome) => {
        if (outcome.status === 'permission_denied') setMicrophoneReady(false);
        if (outcome.status === 'insufficient_storage') {
          Alert.alert(
            'Stockage insuffisant',
            'Libérez de l’espace avant d’enregistrer une dictée.',
          );
          router.back();
        }
      });
  }, [params.appointmentId, router, session]);

  useEffect(() => {
    if (phase !== 'recording') return undefined;

    // This timer only drives the display and the automatic stop. The stored
    // duration comes from the recorder's own native value.
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      if (session.shouldAutoStop(elapsed)) void finish();
    }, 250);

    return () => clearInterval(timer);
  }, [finish, phase, session]);

  const contextLabel = params.appointmentId ? 'Rendez-vous' : null;

  if (phase === 'recording') {
    return (
      <RecordScreen
        contextLabel={contextLabel}
        elapsedMs={elapsedMs}
        microphoneReady={microphoneReady}
        onCancel={() => {
          void session.cancel().then(() => router.back());
        }}
        onOpenSettings={() => {
          void Linking.openSettings();
        }}
        onStop={() => {
          void finish();
        }}
      />
    );
  }

  return (
    <ReviewScreen
      contextLabel={contextLabel}
      durationMs={captured?.durationMs ?? 0}
      onConfirmRedo={() =>
        new Promise<boolean>((resolve) => {
          Alert.alert(
            'Recommencer',
            'Supprimer cette dictée et réenregistrer ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Recommencer', onPress: () => resolve(true) },
            ],
          );
        })
      }
      onRedo={() => {
        if (!captured) return;
        void (async () => {
          await adapters.fileSystem.deleteFile(captured.encryptedFileUri);
          await ports.repository.remove(captured.id);
          router.replace({
            pathname: '/(app)/record',
            params: params.appointmentId
              ? { appointmentId: params.appointmentId }
              : {},
          });
        })();
      }}
      onTogglePlayback={() => {
        if (player.playing) player.pause();
        else player.play();
      }}
      onValidate={() => {
        if (!captured) return;
        void (async () => {
          // Local only: validating never contacts the server, so it works in
          // airplane mode.
          const at = new Date().toISOString();
          await ports.repository.transition(captured.id, ['review'], {
            status: 'queued',
            validatedAt: at,
            updatedAt: at,
          });
          // Validation is local; this only asks the coordinator to look, and it
          // is a no-op while offline.
          void ports.requestSync('validation');
          router.replace('/(app)/captures');
        })();
      }}
      playing={player.playing}
    />
  );
}
