// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ONBOARDING_VIDEO } from "./onboarding-video";
import {
  ONBOARDING_PROGRESS_STORAGE_KEY,
  isOnboardingCompleted,
  parseOnboardingProgress,
  useOnboardingProgress,
} from "./use-onboarding-progress";

/**
 * Le jsdom de ce dépôt expose un `window.localStorage` vide, sans `getItem` ni
 * `setItem`. On installe donc un stockage mémoire pour éprouver le vrai chemin
 * du hook — sinon chaque test tomberait dans sa branche « le navigateur refuse
 * le stockage », qui a son propre test plus bas.
 */
function installMemoryStorage() {
  const entries = new Map<string, string>();

  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, String(value));
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
    clear: () => {
      entries.clear();
    },
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });

  return storage;
}

let storage = installMemoryStorage();

const readStored = () =>
  JSON.parse(storage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY) ?? "null");

beforeEach(() => {
  storage = installMemoryStorage();
});

afterEach(() => {
  vi.restoreAllMocks();
  storage.clear();
});

const EMPTY = { dismissed: false, watchedSeconds: {}, lastTime: 0 };

describe("parseOnboardingProgress", () => {
  test("a first visit has nothing watched and nothing dismissed", () => {
    expect(parseOnboardingProgress(null)).toEqual(EMPTY);
  });

  test("corrupt storage falls back instead of throwing", () => {
    expect(parseOnboardingProgress("{ not json")).toEqual(EMPTY);
    expect(parseOnboardingProgress('"a string"')).toEqual(EMPTY);
    expect(parseOnboardingProgress("null")).toEqual(EMPTY);
  });

  test("hostile or stale field types are ignored field by field", () => {
    expect(
      parseOnboardingProgress(
        JSON.stringify({
          dismissed: "yes",
          watchedSeconds: "120",
          lastTime: 42,
        }),
      ),
    ).toEqual({ dismissed: false, watchedSeconds: {}, lastTime: 42 });
  });

  test("the resume position is clamped to the video rather than trusted", () => {
    expect(
      parseOnboardingProgress(JSON.stringify({ lastTime: 99999 })),
    ).toMatchObject({ lastTime: ONBOARDING_VIDEO.duration });
    expect(
      parseOnboardingProgress(JSON.stringify({ lastTime: -30 })),
    ).toMatchObject({ lastTime: 0 });
  });

  test("counters for chapters that no longer exist are dropped", () => {
    // Une vidéo réenregistrée renomme ses chapitres : garder les compteurs
    // orphelins retirerait la carte à quelqu'un qui n'a pas vu la nouvelle
    // version.
    expect(
      parseOnboardingProgress(
        JSON.stringify({
          watchedSeconds: { agenda: 30, "chapitre-supprime": 400 },
        }),
      ),
    ).toMatchObject({ watchedSeconds: { agenda: 30 } });
  });

  test("counters that are not positive numbers are dropped", () => {
    expect(
      parseOnboardingProgress(
        JSON.stringify({ watchedSeconds: { agenda: "30", patients: -5 } }),
      ),
    ).toMatchObject({ watchedSeconds: {} });
  });
});

/** Toutes les secondes de chaque chapitre, comme après une lecture complète. */
const everyChapterWatched = () =>
  Object.fromEntries(
    ONBOARDING_VIDEO.chapters.map((chapter, index) => [
      chapter.id,
      (ONBOARDING_VIDEO.chapters[index + 1]?.startsAt ??
        ONBOARDING_VIDEO.duration) - chapter.startsAt,
    ]),
  );

describe("isOnboardingCompleted", () => {
  test("the closing thanks are not required to count as watched", () => {
    const watchedSeconds = everyChapterWatched();
    delete watchedSeconds.settings;

    expect(
      isOnboardingCompleted({ dismissed: false, watchedSeconds, lastTime: 0 }),
    ).toBe(false);

    expect(
      isOnboardingCompleted({
        dismissed: false,
        watchedSeconds: everyChapterWatched(),
        lastTime: 0,
      }),
    ).toBe(true);
  });

  test("stopping midway does not count", () => {
    expect(
      isOnboardingCompleted({
        dismissed: false,
        watchedSeconds: { overview: 64, agenda: 34 },
        lastTime: 98,
      }),
    ).toBe(false);
  });

  test("rewatching one chapter cannot stand in for the whole video", () => {
    // Sans plafond par chapitre, boucler sur l'agenda ferait croire que la
    // présentation entière a été vue.
    expect(
      isOnboardingCompleted({
        dismissed: false,
        watchedSeconds: { agenda: ONBOARDING_VIDEO.duration * 5 },
        lastTime: 98,
      }),
    ).toBe(false);
  });
});

describe("useOnboardingProgress", () => {
  test("reads what a previous session stored", () => {
    storage.setItem(
      ONBOARDING_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        dismissed: false,
        watchedSeconds: { overview: 64 },
        lastTime: 118,
      }),
    );

    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.progress).toEqual({
      dismissed: false,
      watchedSeconds: { overview: 64 },
      lastTime: 118,
    });
    expect(result.current.shouldPromptOnboarding).toBe(true);
  });

  test("dismissing hides the card and survives a remount", () => {
    const { result, unmount } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.shouldPromptOnboarding).toBe(false);
    expect(readStored()).toMatchObject({ dismissed: true });

    unmount();
    const remounted = renderHook(() => useOnboardingProgress());

    expect(remounted.result.current.shouldPromptOnboarding).toBe(false);
  });

  test("watched seconds add up across saves instead of overwriting", () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.saveProgress(30, { overview: 30 });
    });
    act(() => {
      result.current.saveProgress(60, { overview: 30 });
    });

    expect(result.current.progress?.watchedSeconds).toEqual({ overview: 60 });
  });

  test("rewinding keeps the chapters already watched", () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.saveProgress(200, { overview: 64 });
    });
    act(() => {
      result.current.saveProgress(30);
    });

    expect(result.current.progress?.watchedSeconds).toEqual({ overview: 64 });
    expect(result.current.progress?.lastTime).toBe(30);
  });

  test("jumping to the end does not pass for having watched it", () => {
    // Le défaut que ce test verrouille : se fier au point le plus loin atteint
    // ferait passer un saut jusqu'au générique pour une lecture complète.
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.saveProgress(ONBOARDING_VIDEO.duration - 1);
    });

    expect(result.current.hasWatchedOnboarding).toBe(false);
    expect(result.current.shouldPromptOnboarding).toBe(true);
  });

  test("watching it through retires the card on its own", () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.saveProgress(
        ONBOARDING_VIDEO.duration,
        everyChapterWatched(),
      );
    });

    expect(result.current.shouldPromptOnboarding).toBe(false);
    expect(result.current.hasWatchedOnboarding).toBe(true);
  });

  test("reopening brings a dismissed card back", () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.dismiss();
    });
    act(() => {
      result.current.reopen();
    });

    expect(result.current.shouldPromptOnboarding).toBe(true);
  });

  test("a browser that refuses storage still renders a usable card", () => {
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.progress).toEqual(EMPTY);

    expect(() => {
      act(() => {
        result.current.saveProgress(42);
      });
    }).not.toThrow();

    // La progression est perdue au rechargement, mais pas pendant la session :
    // le lecteur doit garder sa position d'un rendu à l'autre.
    expect(result.current.progress?.lastTime).toBe(42);
  });

  test("another tab dismissing the card is picked up here", () => {
    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.shouldPromptOnboarding).toBe(true);

    act(() => {
      storage.setItem(
        ONBOARDING_PROGRESS_STORAGE_KEY,
        JSON.stringify({ dismissed: true, watchedSeconds: {}, lastTime: 0 }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: ONBOARDING_PROGRESS_STORAGE_KEY }),
      );
    });

    expect(result.current.shouldPromptOnboarding).toBe(false);
  });
});
