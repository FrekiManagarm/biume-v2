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

export type AppPhase = 'loading' | 'signed-out' | 'no-organization' | 'ready';

export type AppStateValue = {
  phase: AppPhase;
  online: boolean;
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
  bootstrap,
  isOnline,
}: AppStateProviderProps) {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [organizations, setOrganizations] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const online = isOnline?.() ?? true;

  const resolvePhase = useCallback(async () => {
    const session = await refreshSession();
    if (!session) {
      setPhase('signed-out');
      return;
    }
    if (!session.session.activeOrganizationId) {
      setOrganizations(await listOrganizations());
      setPhase('no-organization');
      return;
    }
    setPhase('ready');
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        // SQLite migrations and crash recovery run before any screen reads the
        // queue, so a restarted app never shows a half-recovered state.
        await bootstrap?.();
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
              : 'Organisation active non modifiée.',
          );
        } finally {
          setPending(false);
        }
      },
      async leave() {
        await signOut();
        setPhase('signed-out');
      },
    }),
    [error, online, organizations, pending, phase, resolvePhase],
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
