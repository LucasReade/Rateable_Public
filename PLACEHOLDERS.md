# Rateable landing page — placeholder inventory

The page ships with real assets. There are no visible placeholder boxes: no `data-slot`
attributes remain in `index.html`, and every `src` in the markup resolves to a file that exists.

## Screenshots the page loads (`assets/img/shots/`)

Resized and re-encoded JPEG from the 2026-11-02 media shoot in
`../Rateable/docs/media/` (commit `2b692a5`). The selected originals are in
`assets/img/screen_shots/`; the previous shoot's optimised files are in
`assets/img/screen_shots/legacy-shots/`.

| File                          | Dimensions  | Size     | Used in                |
|-------------------------------|-------------|----------|------------------------|
| `org-dashboard.jpg`           | 1280 × 800  | 91.2 KB  | Hero                   |
| `rating-waterfall.jpg`        | 1800 × 1012 | 134.0 KB | How it works           |
| `lookup-tables.jpg`           | 1600 × 1000 | 117.8 KB | Walkthrough demo       |
| `integrators.jpg`             | 1600 × 1000 | 86.7 KB  | Walkthrough demo       |

The hero is preloaded and marked `loading="eager" fetchpriority="high"`; the rest are lazy.
The hero frame is 16:10, matching the source, so the dashboard is not side-cropped.

## Screen recording (`assets/video/`)

| File                  | Dimensions | Size     | Used in          |
|-----------------------|------------|----------|------------------|
| `dry-run.mp4`         | 1280 × 800 | 144.7 KB | Walkthrough demo |
| `dry-run.webm`        | 1280 × 800 | 115.2 KB | Walkthrough demo |
| `dry-run-poster.jpg`  | 1280 × 800 | 97.0 KB  | Video poster     |

Trimmed to the 4.7 s action window from 3.6 s (the moment the dry-run modal opens) in
`../Rateable/docs/media/gifs/raw/dry-run.webm`. The poster is taken from the same modal scene so
it matches the first frame. The video is lazy (`preload="none"`), muted,
looped and paused when off screen. It does not autoplay when
`prefers-reduced-motion: reduce` is set, and a Play/Pause button is exposed.

## Intentional text placeholders

| Placeholder             | Where                | What to do with it                                          |
|-------------------------|----------------------|-------------------------------------------------------------|
| `YOUR-API-HOST`         | Request curl sample  | Replace with the production hostname. Left as-is on purpose: a real host here would be a false claim. |
| `rt-demo-...`           | Request curl sample  | Obfuscated example key. Keep it obviously fake.             |

## Still to add (nothing on the page currently claims these)

| Slot                          | Target file                        | Notes                                                        |
|-------------------------------|------------------------------------|--------------------------------------------------------------|
| Customer / partner logos      | `assets/img/logo-*.svg`            | The proof strip uses abstract metrics instead of invented logos. Swap in real logos (≈140 × 40) once the first beta cohort signs. |
| Mobile screenshots            | `assets/img/shots/mobile-*.jpg`    | Optional "panel in your pocket" section. `m02` (dashboard) and `m03` (providers) are viable; `m04` needs horizontal scroll and `m05` is too tall. |
| Privacy and terms             | `/privacy`, `/terms`               | Not written. The footer omits the links rather than shipping dead URLs. Required before launch, not optional housekeeping: the contact form posts an email address, message, `utm_source`, referrer and IP to a Google Sheet, and the page has to say so somewhere linked. |
| Infra / DPA detail page       | —                                  | The security section is honest that specifics are available on request rather than inventing them. |

## Real assets (already in place — do not replace)

- `assets/img/logo.jpg` (320 × 49) — nav logo.
- `assets/img/logo_light.jpg` (320 × 49) — footer logo.
- `assets/img/favicon.png` — favicon.
- `assets/img/og-image.jpg` — 1200 × 630 social share card, referenced in `<head>` only.
- `assets/img/screen_shots/` — selected source PNGs for the current shots (`org-dashboard.png`,
  `rating-waterfall.png`, `lookup-tables.png`, `integrators.png`), plus the previous shoot's
  originals and the optimised files in `legacy-shots/`. Nothing here is referenced by the page.
- `assets/img/logo.png` and `logo_light.png` are the higher-weight logo originals. Nothing
  references them; they are kept for re-export.

Testimonial quotes and all product facts in the page copy are illustrative — update copy, not
assets, when you have real customers.
