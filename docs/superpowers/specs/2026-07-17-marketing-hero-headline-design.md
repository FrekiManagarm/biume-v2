# Marketing Hero Headline Refinement

## Context

The current hero headline communicates the full positioning, but its length makes the opening feel heavier than the rest of the soft-machine landing page. The refinement should make the owner-facing benefit immediately legible while preserving the practitioner's control as a secondary promise.

## Approved headline

Use the following five-word headline:

> Le propriétaire comprend. Vous décidez.

The first sentence states the primary outcome for the animal owner. The second restores the practitioner's agency and connects the headline to the existing control narrative.

## Visual treatment

- Keep the headline as one semantic `h1`.
- Present the two sentences as two intentional lines on wide screens. Allow the first sentence to wrap naturally on narrow screens without overflowing.
- Keep `Le propriétaire` in the main ink color.
- Set `comprend.` in `#4F859F`, a darker tonal version of the Biume connection blue. It reaches 3.77:1 against the hero canvas, above the 3:1 requirement for large text; expose it as `--machine-blue-ink` for reuse.
- Set `Vous` in the main ink color and `décidez.` in the existing decision violet `#6B5AC8`, which reaches 4.99:1 against the canvas.
- Do not use gradient text. Solid color preserves legibility and keeps each brand color tied to a clear meaning.
- Do not use green in this headline because the copy does not describe a confirmed or completed state.

## Scope

Change only the hero headline markup and the minimum supporting color token or utility needed for accessible blue text. Keep the supporting paragraph, calls to action, hero image, reassurance row, spacing rhythm, and motion behavior unchanged unless a small width adjustment is required to preserve the intended line breaks.

## Responsive and accessibility requirements

- The headline must remain readable without horizontal overflow from mobile through desktop.
- Display letter spacing must remain at or above `-0.04em`.
- Colored text must retain its meaning when color is not perceived; the complete sentence must remain understandable as plain text.
- Reduced-motion behavior is unaffected because this change introduces no new animation.

## Verification

- Update the landing hero test to assert the new complete headline.
- Run the focused marketing hero test and the marketing type check.
- Inspect the hero at representative mobile and desktop widths to confirm line breaks, contrast, and visual balance.
