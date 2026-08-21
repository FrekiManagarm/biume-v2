import * as FileSystem from 'expo-file-system';
import type { AudioRecorder, RecordingOptions } from 'expo-audio';
import { requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import type { AudioRecorderPort } from './audio-recorder';
import { biumeRecordingPreset } from './recording-session';

/**
 * The canonical preset expressed in the shape `expo-audio` expects. The values
 * themselves come from `biumeRecordingPreset` so the format cannot drift from
 * what the contracts and the server assume.
 */
export const biumeRecordingOptions: RecordingOptions = {
  extension: biumeRecordingPreset.extension,
  sampleRate: biumeRecordingPreset.sampleRate,
  numberOfChannels: biumeRecordingPreset.numberOfChannels,
  bitRate: biumeRecordingPreset.bitRate,
  android: {
    extension: biumeRecordingPreset.extension,
    outputFormat: biumeRecordingPreset.android.outputFormat,
    audioEncoder: biumeRecordingPreset.android.audioEncoder,
  },
  ios: {
    extension: biumeRecordingPreset.extension,
    outputFormat: biumeRecordingPreset.ios.outputFormat,
    audioQuality: 96,
  },
  // Required by the type. The app targets iOS and Android only; these values
  // keep the container and bitrate consistent if a web build is ever produced.
  web: {
    mimeType: 'audio/mp4',
    bitsPerSecond: biumeRecordingPreset.bitRate,
  },
};

/**
 * Wraps the recorder instance produced by `useAudioRecorder`, so the session
 * state machine never depends on a React hook and stays testable.
 */
export function createExpoAudioRecorder(
  recorder: AudioRecorder,
): AudioRecorderPort {
  return {
    async requestPermission() {
      const { granted } = await requestRecordingPermissionsAsync();
      return granted ? 'granted' : 'denied';
    },

    async start() {
      // iOS refuses to create a recorder until the audio session is
      // switched into a recording-capable category.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync(biumeRecordingOptions);
      recorder.record();
      const uri = recorder.uri;
      if (!uri) throw new Error("L'enregistreur n'a produit aucun fichier.");
      return { uri };
    },

    async stop() {
      // Read the duration before stopping: the native recorder resets its
      // position once the file is finalized.
      const durationMs = Math.round(recorder.currentTime * 1000);
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("L'enregistrement n'a produit aucun fichier.");
      return { uri, durationMs };
    },

    async cancel() {
      const uri = recorder.uri;
      if (recorder.isRecording) await recorder.stop();
      if (uri) new FileSystem.File(uri).delete();
    },
  };
}
