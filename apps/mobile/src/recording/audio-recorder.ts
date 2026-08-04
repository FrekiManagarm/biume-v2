export type MicrophonePermission = 'granted' | 'denied';

export type StartedRecording = { uri: string };
export type FinishedRecording = { uri: string; durationMs: number };

/**
 * The recording capabilities the session depends on. Pause and resume are
 * deliberately absent: the alpha records one continuous take, and offering a
 * pause would make the ten-minute ceiling ambiguous.
 */
export interface AudioRecorderPort {
  requestPermission(): Promise<MicrophonePermission>;
  start(): Promise<StartedRecording>;
  stop(): Promise<FinishedRecording>;
  cancel(): Promise<void>;
}

export interface StorageGuardPort {
  hasRoomForRecording(): Promise<boolean>;
}
