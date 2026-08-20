import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  listOrganizations,
  refreshSession,
  setActiveOrganization,
  signInWithEmail,
  signOut,
} from '../auth/auth-session';
import { requeueAfterSignIn } from '../capture/capture-actions';
import {
  bootstrapWorkspace,
  networkMonitor,
  openRepository,
  requestSync,
} from './workspace-ports';
import { resolveSessionPhase, type AppPhase } from './session-phase';

export type { AppPhase };

export type AppStateValue = {
  phase: AppPhase;
  online: boolean;
  organizationId: string | null;
  organizations: Array<{ id: string; name: string }>;
  error: string | null;
  pending: boolean;
  signIn(input: { email: string; password: string }): Promise<void>;
  chooseOrganization(organizationId: string): Promise<void>;
  leave(): Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export type AppStateProviderProps = {
  children: ReactNode;
  /** Injected so the boot sequence can be driven in tests. */
  bootstrap?: () => Promise<void>;
  isOnline?: () => boolean;
};

/**
 * Owns the boot sequence and the routing phase. Screens never reach for the
 * session or the database themselves — they receive a phase and call actions.
 */
export function AppStateProvider({
  children,
  bootstrap = bootstrapWorkspace,
  isOnline,
}: AppStateProviderProps) {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const online = (isOnline ?? (() => networkMonitor.isOnline()))();

  const resolvePhase = useCallback(async () => {
    const resolved = resolveSessionPhase(await refreshSession());

    setOrganizationId(resolved.organizationId);
    if (resolved.phase === 'no-organization') {
      setOrganizations(await listOrganizations());
    }
    setPhase(resolved.phase);

    // The other half of the `reconnect` action: captures that were only ever
    // blocked by an expired session go back to the queue as soon as there is a
    // session again.
    if (resolved.phase === 'ready') {
      try {
        const requeued = await requeueAfterSignIn(
          await openRepository(),
          new Date(),
        );
        if (requeued > 0) await requestSync('validation');
      } catch {
        // A queue that could not be revived is retried at the next launch;
        // it must never block the practitioner from reaching the app.
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        // SQLite migrations and crash recovery run before any screen reads the
        // queue, so a restarted app never shows a half-recovered state.
        await bootstrap();
        if (!cancelled) await resolvePhase();
      } catch {
        if (!cancelled) setPhase('signed-out');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrap, resolvePhase]);

  const value = useMemo<AppStateValue>(
    () => ({
      phase,
      online,
      organizationId,
      organizations,
      error,
      pending,
      async signIn(input) {
        setPending(true);
        setError(null);
        try {
          await signInWithEmail(input);
          await resolvePhase();
        } catch (caught) {
          setError(
            caught instanceof Error ? caught.message : 'Connexion impossible.',
          );
        } finally {
          setPending(false);
        }
      },
      async chooseOrganization(organizationId) {
        setPending(true);
        setError(null);
        try {
          await setActiveOrganization(organizationId);
          await resolvePhase();
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Entreprise active non modifiée.',
          );
        } finally {
          setPending(false);
        }
      },
      async leave() {
        await signOut();
        setOrganizationId(null);
        setPhase('signed-out');
      },
    }),
    [error, online, organizationId, organizations, pending, phase, resolvePhase],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState doit être utilisé dans AppStateProvider.');
  }
  return value;
}
