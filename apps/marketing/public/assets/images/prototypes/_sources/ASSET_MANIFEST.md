# Prototype asset manifest

| Deliverable | Category | Final asset | Master / provenance | Output | Alpha | QA / intentional deviation |
| --- | --- | --- | --- | --- | --- | --- |
| Daylight limestone observation still life | produce → direct | `laboratoire-hero.webp` | `laboratoire-hero-master.png`, generated from `laboratoire-mock-reference.png` palette/material reference | 1920 × 1280 WebP, Q88 | None | No legible text, UI, logo, border, or shadow. Paper marks are intentionally non-semantic; UI report content belongs in HTML. |
| Moving dog in grassland | produce → direct | `laboratoire-followup.webp` | `laboratoire-followup-master.png`, generated from `laboratoire-mock-reference.png` light/palette reference | 1600 × 640 WebP, Q88 | None | Natural side-on gait; no people, branding, text, or clinical setting. |
| Blue-hour horse contact | produce → direct | `after-dark-hero.webp` | `after-dark-hero-master.png`, generated from `after-dark-mock-reference.png` palette/material reference | 1920 × 1280 WebP, Q88 | None | Hand and horse remain lower/right. The left 35–40% remains plain dark sky for semantic HTML copy. No text/UI/branding. |
| Physical report sketch detail | produce → direct | `after-dark-report-detail.webp` | `after-dark-report-detail-master.png`, generated from `after-dark-mock-reference.png` material/report reference | 1600 × 1000 WebP, Q88 | None | Only abstract graphite marks and non-readable diagram lines; report title, data and controls must be semantic HTML. |

## Source references

- `laboratoire-mock-reference.png`: approved solar composite source.
- `after-dark-mock-reference.png`: approved nocturnal composite source.

## Production prompts (built-in image generation)

1. **`laboratoire-hero.webp`** — "High-end editorial still-life photograph of a daylight tactile observation setting on an unpolished pale limestone and charcoal stone workshop surface. Include one open, unbranded paper notebook with abstract graphite observation marks that are not readable as words, a slender dark graphite pencil, and a small oxidized copper cup or object. Broad 3:2 tabletop composition; notebook lower-left to center and clean upper/right negative space. Clear late-morning sun and one natural hard shadow. Palette: limestone, charcoal, quiet moss, sun-bleached muted yellow and oxidized copper. No readable text, logo, UI, people, animals, watermark, baked card, border or shadow."
2. **`laboratoire-followup.webp`** — "A single healthy working dog moving naturally through open dry grassland, caught mid-stride from a low side angle; no handler or collar branding. Extremely wide 5:2 landscape; dog in the middle third, broad grass texture on both sides. Truthful late-afternoon animal photography, dry straw, charcoal brown, muted moss and pale sky. No people, buildings, logos, text, UI, watermark or artificial anatomy."
3. **`after-dark-hero.webp`** — "At blue hour, a practitioner’s unbranded hand rests gently on the shoulder of a calm dark horse at the lower right edge, on wet honed charcoal stone with faint reflections and deep clouded night-blue sky. Landscape 3:2; reserve 35–40% of the left side as plain dark negative space for HTML headline. Midnight navy, charcoal wet stone, deep moss and dim oxidized copper. No readable text, UI, report pages, brands, watermark, clinical setting or cartoon animal."
4. **`after-dark-report-detail.webp`** — "Close tactile photograph of a real off-white physical report page lying on wet honed charcoal stone. The page carries only non-readable graphite sketch marks, abstract anatomical contour studies, faint diagram lines, pencil shading, and restrained moss-green and oxidized-copper accents. Landscape 8:5. No legible words, numbers, logos, UI, typed text, people, animal faces, screens, watermark or floating papers."

## Execution order

1. Copy and inspect both approved mock references.
2. Generate the four independent photographic compositions with each matching mock as a material/palette reference only.
3. Inspect for composition, readable text, UI, logos, animal anatomy and negative space.
4. Resample masters to requested production dimensions, then encode final non-transparent WebP at quality 88.

## Semantic handoff

The assets are atmospheric/media-only. Navigation, headlines, buttons, report content, progress/timeline visuals, all accessible labels, alt text, and interaction state must be supplied by the parent implementation rather than baked into imagery.
