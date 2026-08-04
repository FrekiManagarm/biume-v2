import type { LocalCaptureStatus } from '@biume/contracts/capture';
import type { LocalCapture } from './local-capture';

export type CapturePatch = Partial<Omit<LocalCapture, 'id'>>;

/**
 * Minimal async surface mirroring `expo-sqlite`, so the repository can be
 * exercised against a real SQL engine in tests without a simulator.
 */
export interface CaptureSqliteDatabase {
  execAsync(source: string): Promise<void>;
  /** Both `expo-sqlite` and `node:sqlite` report the affected row count here. */
  runAsync(source: string, params?: unknown[]): Promise<{ changes: number }>;
  getFirstAsync<T>(source: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, params?: unknown[]): Promise<T[]>;
}

export interface CaptureRepository {
  insertReview(capture: LocalCapture): Promise<void>;
  transition(
    id: string,
    from: LocalCaptureStatus[],
    patch: CapturePatch,
  ): Promise<boolean>;
  get(id: string): Promise<LocalCapture | null>;
  list(): Promise<LocalCapture[]>;
  nextEligible(now: string): Promise<LocalCapture | null>;
  markExpired(now: string): Promise<LocalCapture[]>;
  remove(id: string): Promise<void>;
}
