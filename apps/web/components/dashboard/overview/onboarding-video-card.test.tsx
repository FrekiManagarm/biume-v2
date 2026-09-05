// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ONBOARDING_PROGRESS_STORAGE_KEY } from "#/lib/dashboard/use-onboarding-progress";
import { ONBOARDING_VIDEO } from "#/lib/dashboard/onboarding-video";

import {
  OnboardingReplayLink,
  OnboardingVideoCard,
} from "./onboarding-video-card";

const VIDEO_URL = "https://example.test/presentation.mp4";

/** Voir `use-onboarding-progress.test.ts` : le jsdom du dépôt n'en fournit pas. */
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

const storeProgress = (progress: {
  dismissed?: boolean;
  watchedSeconds?: Record<string, number>;
  lastTime?: number;
}) => {
  storage.setItem(
    ONBOARDING_PROGRESS_STORAGE_KEY,
    JSON.stringify({
      dismissed: false,
      watchedSeconds: {},
      lastTime: 0,
      ...progress,
    }),
  );
};

/** Toutes les secondes de chaque chapitre, comme après une lecture complète. */
const everyChapterWatched = () =>
  Object.fromEntries(
    ONBOARDING_VIDEO.chapters.map((chapter, index) => [
      chapter.id,
      (ONBOARDING_VIDEO.chapters[index + 1]?.startsAt ??
        ONBOARDING_VIDEO.duration) - chapter.startsAt,
    ]),
  );

beforeEach(() => {
  storage = installMemoryStorage();
  vi.stubEnv("NEXT_PUBLIC_ONBOARDING_VIDEO_URL", VIDEO_URL);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  storage.clear();
});

describe("OnboardingVideoCard", () => {
  test("presents the video, its length and every chapter it contains", () => {
    render(<OnboardingVideoCard />);

    expect(
      screen.getByRole("heading", { name: "Bienvenue sur Biume" }),
    ).toBeDefined();

    for (const chapter of ONBOARDING_VIDEO.chapters) {
      expect(screen.getAllByText(chapter.label).length).toBeGreaterThan(0);
    }

    expect(screen.getAllByText("7:38").length).toBeGreaterThan(0);
  });

  test("costs nothing until asked: the poster is an image, there is no video element", () => {
    const { container } = render(<OnboardingVideoCard />);

    expect(container.querySelector("video")).toBeNull();

    // `next/image` fait passer l'affiche par son optimiseur : on vérifie
    // qu'elle pointe bien vers le fichier, pas la forme exacte de l'URL.
    const poster = container.querySelector("img");

    expect(poster?.getAttribute("src")).toContain(
      encodeURIComponent(ONBOARDING_VIDEO.poster),
    );
  });

  test("stays hidden when no video has been published", () => {
    vi.stubEnv("NEXT_PUBLIC_ONBOARDING_VIDEO_URL", "");

    const { container } = render(<OnboardingVideoCard />);

    expect(container.firstChild).toBeNull();
  });

  test("offers to resume where the practitioner stopped", () => {
    storeProgress({ lastTime: 228 });

    render(<OnboardingVideoCard />);

    expect(
      screen.getByRole("button", { name: "Reprendre à 3:48" }),
    ).toBeDefined();
  });

  test("hiding it retires the card and leaves a way back", async () => {
    const user = userEvent.setup();

    render(
      <>
        <OnboardingVideoCard />
        <OnboardingReplayLink />
      </>,
    );

    expect(screen.queryByText("Bienvenue sur Biume")).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: /Revoir la présentation/ }),
    ).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Masquer la présentation" }),
    );

    expect(screen.queryByText("Bienvenue sur Biume")).toBeNull();
    expect(
      screen.getByRole("button", { name: /Revoir la présentation/ }),
    ).toBeDefined();
  });

  test("watching it through retires the card without anyone dismissing it", () => {
    storeProgress({ watchedSeconds: everyChapterWatched() });

    render(
      <>
        <OnboardingVideoCard />
        <OnboardingReplayLink />
      </>,
    );

    expect(screen.queryByText("Bienvenue sur Biume")).toBeNull();
    expect(
      screen.getByRole("button", { name: /Revoir la présentation/ }),
    ).toBeDefined();
  });
});

describe("OnboardingVideoDialog, opened from the card", () => {
  test("loads the published file and opens on the chapter being resumed", async () => {
    const user = userEvent.setup();

    storeProgress({ lastTime: 332 });
    render(<OnboardingVideoCard />);

    await user.click(screen.getByRole("button", { name: "Reprendre à 5:32" }));

    const video = document.querySelector("video");

    expect(video?.getAttribute("src")).toBe(VIDEO_URL);
    expect(video?.getAttribute("poster")).toBe(ONBOARDING_VIDEO.poster);

    // Le sixième chapitre commence à 5:32 — c'est celui qui doit être annoncé.
    expect(screen.getByText(/Chapitre 6 sur 7/)).toBeDefined();
  });

  test("a chapter jumps the video and reports the new position", async () => {
    const user = userEvent.setup();

    render(<OnboardingVideoCard />);
    await user.click(
      screen.getByRole("button", { name: "Regarder la présentation" }),
    );

    const chapters = screen.getByRole("list", { name: "Chapitres" });

    await user.click(
      within(chapters).getByRole("button", { name: /Patients/ }),
    );

    const video = document.querySelector("video");

    expect(video?.currentTime).toBe(146);
    expect(screen.getByText(/Chapitre 4 sur 7/)).toBeDefined();
  });

  test("the progress bar carries one segment per chapter, sized to its length", async () => {
    const user = userEvent.setup();

    render(<OnboardingVideoCard />);
    await user.click(
      screen.getByRole("button", { name: "Regarder la présentation" }),
    );

    const bar = screen.getByRole("slider", {
      name: "Progression de la présentation",
    });

    const segments = Array.from(bar.children) as HTMLElement[];

    expect(segments).toHaveLength(ONBOARDING_VIDEO.chapters.length);

    // Le premier chapitre dure 64 s, le deuxième 34 : la barre doit le dire.
    expect(segments[0]!.style.flexGrow).toBe("64");
    expect(segments[1]!.style.flexGrow).toBe("34");
  });

  test("closing writes the position back, so the card offers to resume there", async () => {
    const user = userEvent.setup();

    render(<OnboardingVideoCard />);
    await user.click(
      screen.getByRole("button", { name: "Regarder la présentation" }),
    );

    const chapters = screen.getByRole("list", { name: "Chapitres" });

    await user.click(
      within(chapters).getByRole("button", { name: /Planifier une séance/ }),
    );
    await user.keyboard("{Escape}");

    expect(
      JSON.parse(storage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({ lastTime: 228 });

    expect(
      screen.getByRole("button", { name: "Reprendre à 3:48" }),
    ).toBeDefined();
  });
});

describe("chapter ticks", () => {
  test("jumping to a chapter does not tick the ones it skipped over", async () => {
    // Ce que le navigateur a révélé : compter le point le plus loin atteint
    // faisait cocher les quatre premiers chapitres dès qu'on sautait au
    // cinquième, sans que personne ne les ait regardés.
    const user = userEvent.setup();

    render(<OnboardingVideoCard />);
    await user.click(
      screen.getByRole("button", { name: "Regarder la présentation" }),
    );

    const chapters = screen.getByRole("list", { name: "Chapitres" });

    await user.click(
      within(chapters).getByRole("button", { name: /Planifier une séance/ }),
    );

    expect(within(chapters).queryAllByText("Chapitre déjà vu")).toHaveLength(0);
  });

  test("a chapter played through is ticked", async () => {
    const user = userEvent.setup();

    storeProgress({ watchedSeconds: { overview: 64 } });
    render(<OnboardingVideoCard />);
    await user.click(
      screen.getByRole("button", { name: "Regarder la présentation" }),
    );

    const chapters = screen.getByRole("list", { name: "Chapitres" });

    expect(within(chapters).getAllByText("Chapitre déjà vu")).toHaveLength(1);
  });
});
