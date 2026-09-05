import { describe, expect, test } from "vitest";

import {
  CHAPTER_WATCHED_RATIO,
  ONBOARDING_VIDEO,
  buildChapterSegments,
  formatDuration,
  formatTimecode,
  isChapterWatched,
  resolveActiveChapterIndex,
  totalWatchedSeconds,
} from "./onboarding-video";

describe("ONBOARDING_VIDEO", () => {
  test("chapters are ordered, start at zero and stay inside the video", () => {
    const chapters = ONBOARDING_VIDEO.chapters;

    expect(chapters[0]?.startsAt).toBe(0);

    for (const [index, chapter] of chapters.entries()) {
      expect(chapter.startsAt).toBeLessThan(ONBOARDING_VIDEO.duration);

      if (index > 0) {
        expect(chapter.startsAt).toBeGreaterThan(chapters[index - 1]!.startsAt);
      }
    }
  });

  test("chapter ids are unique", () => {
    const ids = ONBOARDING_VIDEO.chapters.map((chapter) => chapter.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("buildChapterSegments", () => {
  const segments = buildChapterSegments();

  test("each segment ends where the next one starts, the last on the credits", () => {
    for (const [index, segment] of segments.entries()) {
      const next = segments[index + 1];

      expect(segment.endsAt).toBe(next?.startsAt ?? ONBOARDING_VIDEO.duration);
      expect(segment.duration).toBe(segment.endsAt - segment.startsAt);
    }
  });

  test("widths add up to the whole bar", () => {
    const total = segments.reduce(
      (sum, segment) => sum + segment.widthRatio,
      0,
    );

    expect(total).toBeCloseTo(1, 10);
  });

  test("a segment starts where the previous one ended, proportionally", () => {
    expect(segments[0]?.offsetRatio).toBe(0);

    for (const [index, segment] of segments.entries()) {
      const previous = segments[index - 1];

      if (previous) {
        expect(segment.offsetRatio).toBeCloseTo(
          previous.offsetRatio + previous.widthRatio,
          10,
        );
      }
    }
  });
});

describe("resolveActiveChapterIndex", () => {
  test("holds the chapter until the next one actually starts", () => {
    const [first, second] = ONBOARDING_VIDEO.chapters;

    expect(resolveActiveChapterIndex(0)).toBe(0);
    expect(resolveActiveChapterIndex(second!.startsAt - 0.5)).toBe(0);
    expect(resolveActiveChapterIndex(second!.startsAt)).toBe(1);
    expect(first!.startsAt).toBe(0);
  });

  test("clamps outside the video rather than returning nothing", () => {
    expect(resolveActiveChapterIndex(-30)).toBe(0);
    expect(resolveActiveChapterIndex(ONBOARDING_VIDEO.duration + 60)).toBe(
      ONBOARDING_VIDEO.chapters.length - 1,
    );
  });

  test("survives a video element reporting NaN before metadata loads", () => {
    expect(resolveActiveChapterIndex(Number.NaN)).toBe(0);
  });
});

describe("isChapterWatched", () => {
  const segments = buildChapterSegments();
  const second = segments[1]!;

  test("only counts a chapter once most of it has been played", () => {
    expect(isChapterWatched(second, { [second.id]: 0 })).toBe(false);
    expect(
      isChapterWatched(second, {
        [second.id]: second.duration * (CHAPTER_WATCHED_RATIO - 0.1),
      }),
    ).toBe(false);
    expect(
      isChapterWatched(second, {
        [second.id]: second.duration * CHAPTER_WATCHED_RATIO,
      }),
    ).toBe(true);
    expect(isChapterWatched(second, { [second.id]: second.duration })).toBe(
      true,
    );
  });

  test("a chapter never seen is not watched", () => {
    expect(isChapterWatched(second, {})).toBe(false);
  });

  test("watching a neighbour does not tick this one", () => {
    // Le fond du sujet : sauter au chapitre 5 ne doit rien cocher en amont.
    expect(
      isChapterWatched(second, { [segments[4]!.id]: segments[4]!.duration }),
    ).toBe(false);
  });
});

describe("totalWatchedSeconds", () => {
  const segments = buildChapterSegments();

  test("adds the chapters up", () => {
    expect(
      totalWatchedSeconds({
        [segments[0]!.id]: segments[0]!.duration,
        [segments[1]!.id]: segments[1]!.duration,
      }),
    ).toBe(segments[0]!.duration + segments[1]!.duration);
  });

  test("caps each chapter at its own length, so rewatching cannot inflate it", () => {
    expect(
      totalWatchedSeconds({ [segments[0]!.id]: ONBOARDING_VIDEO.duration * 3 }),
    ).toBe(segments[0]!.duration);
  });

  test("a full watch adds up to the whole video", () => {
    const everything = Object.fromEntries(
      segments.map((segment) => [segment.id, segment.duration]),
    );

    expect(totalWatchedSeconds(everything)).toBe(ONBOARDING_VIDEO.duration);
  });

  test("unknown chapters contribute nothing", () => {
    expect(totalWatchedSeconds({ "chapitre-supprime": 400 })).toBe(0);
  });
});

describe("formatTimecode", () => {
  test("renders minutes and padded seconds", () => {
    expect(formatTimecode(0)).toBe("0:00");
    expect(formatTimecode(9)).toBe("0:09");
    expect(formatTimecode(64)).toBe("1:04");
    expect(formatTimecode(458)).toBe("7:38");
  });

  test("never renders a negative or non-finite timecode", () => {
    expect(formatTimecode(-12)).toBe("0:00");
    expect(formatTimecode(Number.NaN)).toBe("0:00");
    expect(formatTimecode(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});

describe("formatDuration", () => {
  test("reads as a spoken length, not as a clock", () => {
    expect(formatDuration(ONBOARDING_VIDEO.duration)).toBe("7 min 38");
    expect(formatDuration(64)).toBe("1 min 04");
  });

  test("drops the seconds on a round minute", () => {
    expect(formatDuration(420)).toBe("7 min");
  });

  test("falls back to seconds under a minute", () => {
    expect(formatDuration(38)).toBe("38 s");
    expect(formatDuration(0)).toBe("0 s");
    expect(formatDuration(Number.NaN)).toBe("0 s");
  });
});
