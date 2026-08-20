import { useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useAppState } from '@/app-state/app-state';
import {
  captureFileAdapters,
  interruptedSessionStore,
  useWorkspacePorts,
} from '@/app-state/workspace-ports';
import { useCaptureWorkspace } from '@/app-state/capture-workspace';
import { updateCaptureAttachment } from '@/capture/capture-actions';
import { openCaptureAudio, sealRecording } from '@/capture/capture-files';
import type { LocalCapture } from '@/capture/local-capture';
import {
  biumeRecordingOptions,
  createExpoAudioRecorder,
} from '@/recording/expo-audio-recorder';
import { deviceFreeSpaceBytes } from '@/recording/expo-storage';
import { createRecordingSession } from '@/recording/recording-session';
import { createStorageGuard } from '@/recording/storage-guard';
import { captureTelemetry } from '@/telemetry/telemetry-sink';
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
  const { organizationId } = useAppState();
  const ports = useWorkspacePorts(organizationId ?? '');
  const recorder = useAudioRecorder(biumeRecordingOptions);

  const [phase, setPhase] = useState<'recording' | 'review'>('recording');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [microphoneReady, setMicrophoneReady] = useState(true);
  const [captured, setCaptured] = useState<LocalCapture | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const player = useAudioPlayer(audioUri ?? undefined);
  const startedRef = useRef(false);

  const adapters = useMemo(() => captureFileAdapters(), []);
  const interruptedSessions = useMemo(() => interruptedSessionStore(), []);

  const { primary, upcoming } = useCaptureWorkspace(ports);

  /** The agenda the practitioner may reattach this dictation to, deduplicated. */
  const attachmentCandidates = useMemo(() => {
    const all = primary ? [primary, ...upcoming] : upcoming;
    return Array.from(new Map(all.map((item) => [item.id, item])).values());
  }, [primary, upcoming]);

  const session = useMemo(
    () =>
      createRecordingSession({
        recorder: createExpoAudioRecorder(recorder),
        storage: createStorageGuard(deviceFreeSpaceBytes),
        seal: (input) => sealRecording(input, adapters),
        discardPlaintext: (uri) => adapters.fileSystem.deleteFile(uri),
        // Written before the first sample: a crash one second later still
        // leaves startup recovery enough to find and attribute the take.
        persistInterruptedSession: (interrupted) =>
          interruptedSessions.save(interrupted),
        clearInterruptedSession: () => interruptedSessions.clear(),
        repository: ports.repository,
        newCaptureId: () => randomUUID(),
        now: () => new Date(),
        telemetry: captureTelemetry,
      }),
    [adapters, interruptedSessions, ports.repository, recorder],
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
      return;
    }

    // 'not_recording': the recorder never started (e.g. it failed before
    // `active` was set) or was already stopped. There is nothing to review,
    // so leaving the screen is the only way out of the stuck 'recording' UI.
    router.back();
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

  const attachedAppointmentId =
    captured?.appointmentId ?? params.appointmentId ?? null;

  const attachedAppointment =
    attachmentCandidates.find((item) => item.id === attachedAppointmentId) ??
    null;

  const contextLabel = attachedAppointment
    ? attachedAppointment.patientName
    : attachedAppointmentId
      ? 'Rendez-vous'
      : null;

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
      appointments={attachmentCandidates}
      attachedAppointmentId={attachedAppointmentId}
      contextLabel={contextLabel}
      durationMs={captured?.durationMs ?? 0}
      onChangeAttachment={(attachment) => {
        if (!captured) return;
        void (async () => {
          const changed = await updateCaptureAttachment(
            captured.id,
            attachment,
            { repository: ports.repository, now: new Date() },
          );
          if (changed) setCaptured({ ...captured, ...attachment });
        })();
      }}
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
          // The retake keeps whatever the dictation is attached to now, not
          // what it was attached to when this screen opened.
          router.replace({
            pathname: '/(app)/record',
            params: attachedAppointmentId
              ? { appointmentId: attachedAppointmentId }
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
