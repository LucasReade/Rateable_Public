# Rateable · Landing page

Public-facing marketing page for [Rateable](https://github.com/lucas/PRICR) — the insurance quote
rating engine brokers control. Built to attract potential users.

Static HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework.

## Contents

- `index.html` — the single page, in order:
  hero → proof strip → problem → how it works → features → security/compliance →
  API integration → walkthrough demo → FAQ → pricing + bill calculator → contact → footer.
- `css/styles.css` — one stylesheet built on a token layer (primitive → semantic) in `:root`:
  colour, spacing, type scale, radii, z-index, and motion. Brand hues are locked
  (`#003049` navy, `#D62828` red, `#F77F00` orange, `#FCBF49` gold, `#EAE2B7` cream,
  `#F2F1ED` canvas) and Josefin Sans is the only typeface.
- `js/main.js` — mobile menu, scroll reveal, back-to-top, footer year, code-block copy buttons,
  the pricing calculator, and the contact form.
- `assets/img/shots/` — the product screenshots the page actually loads (resized JPEG from the
  2026-11-02 shoot).
- `assets/img/screen_shots/` — selected source PNGs for the current shots, plus the previous
  shoot's originals and optimised files in `legacy-shots/`. Not referenced by the page.
- `assets/img/og-image.jpg` — 1200×630 social share card.
- `assets/video/` — the trimmed dry-run recording (MP4/WebM) and its poster.
- `robots.txt`, `sitemap.xml` — SEO plumbing (update the domain before deploying).

## Run locally

Open `index.html` directly, or serve the folder:

```powershell
python -m http.server 8080   # then open http://localhost:8080
# or
npx serve .
```

The page works from `file://`. Serving over HTTP is only needed to test anything that needs a
real origin.

## Media

Product media comes from the app repo's shoot at `../Rateable/docs/media/` (2026-11-02, commit
`2b692a5`). The selected originals are copied into `assets/img/screen_shots/`; `assets/img/shots/`
holds the resized JPEGs the page loads, and `assets/video/` holds the trimmed dry-run recording.

To regenerate the page assets:

- **Images** — open the source PNG, crop to the frame ratio (16:10 for the hero and panels, 16:9
  for the wide frame), resize with LANCZOS to the widths in `PLACEHOLDERS.md`, then save JPEG
  quality 80–82, progressive, metadata stripped.
- **Video** — start at 3.6 s in `gifs/raw/dry-run.webm` (the dry-run modal opening) and trim to the
  4.7 s remainder, then encode H.264 MP4 (`-crf 24 -pix_fmt yuv420p -movflags +faststart`) and VP9
  WebM (`-crf 34 -b:v 0`). Take the poster from the same modal scene so it matches the first frame.

## The contact form endpoint

The contact form posts `multipart/form-data` to a Google Apps Script web app:

```
https://script.google.com/macros/s/AKfycbzg890P1isxFpSuthVHji9rF01cKLgHxXBYoZIAng4tAyIUPWRjIevHd8nv4eDT8mCh/exec
```

Five fields, and the keys are the sheet column headers the `doPost` reads — rename them in
`js/main.js` and the HTML `name` attributes together, never one alone:

| Field           | Source                                                            |
|-----------------|-------------------------------------------------------------------|
| `email-address` | the work email input                                               |
| `details`       | the message textarea, optional                                     |
| `utm_source`    | `?utm_source=` on arrival, cached in `sessionStorage`; `''` if absent |
| `referrer`      | `document.referrer`                                                |
| `timestamp`     | `new Date().toISOString()` — UTC, so Sheets parses it as a date    |

Deployment requirements, all of which fail silently from the browser's point of view:

- **Execute as: Me** and **Who has access: Anyone**. Anything else, and the sheet stays empty.
- The request is sent `mode: 'no-cors'`. Apps Script sends no `Access-Control-Allow-Origin` and
  cannot answer a preflight, so a default-mode fetch is blocked and nothing is ever sent.
  `FormData` keeps it a CORS-simple request; setting `Content-Type` by hand would break that.
- Because the response is opaque, the success message only proves the POST left the browser.
  A rejected `fetch` means no connection was made — it never means the row was written. Submit a
  real test entry and check the sheet after any change to the endpoint or the deployment.
- Re-saving the script does not update the deployment. Redeploy to get a new `/exec` URL.

## How the calculator works

`js/main.js` holds the pricing model. It must stay consistent with the copy and the
`SoftwareApplication` JSON-LD block:

- £249/month base, then £95 per product above the first.
- £40 per block of five users above the three included.
- 50,000 quotes included, then progressively billed: £0.009 up to 200,000 of overage,
  £0.0045 up to 950,000, £0.0022 up to 4,950,000, £0.0009 beyond. The slider tops out at
  2,000,000 quotes, so the last band is reachable only by API volume.

If the bands change, update the calculator, the "Request a walkthrough" summary rows, and the
`SoftwareApplication` JSON-LD together, or the page starts quoting two different prices.

## Accessibility notes

- Every text/background pair in the stylesheet is contrast-checked; 4.5:1 for body text and
  3:1 for control boundaries, input borders and focus rings.
- Focus is always visible: a single global `:focus-visible` outline, never removed without
  a replacement.
- The API `<pre>` samples are `tabindex="0"` with an accessible name, so their horizontal
  scroll is reachable by keyboard.
- `prefers-reduced-motion: reduce` disables the scroll reveal and all transitions.
- The calculator total is announced through a debounced `role="status"` live region, and each
  slider reports a spoken value via `aria-valuetext` rather than a raw number.

## Deploy

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages. Before going live:

1. Copy the repo to its own GitHub repository (e.g. `ratables-web`).
2. Replace `https://rateable.uk/` everywhere it appears: `index.html` (canonical, OG, JSON-LD),
   `robots.txt`, `sitemap.xml`.
3. Update `<lastmod>` in `sitemap.xml`.
4. Add real `/privacy` and `/terms` pages and link them from the footer. The footer links are
   deliberately absent rather than pointing at dead URLs. This is no longer housekeeping: the
   contact form puts a name, message, referrer and IP into a Google Sheet.
5. Serve over HTTPS: the copy buttons on the `<pre>` samples need `navigator.clipboard`, which is
   secure-context only. The form posts to an `https` endpoint either way.
6. Confirm the contact form reaches the sheet once on the live domain. See the endpoint section.

## Content accuracy

Product claims reflect the current Rateable app (15 block types, versioning, SHA-256-hashed
scoped API keys, `POST /quotes`, sub-100ms target, aggregates-only quote storage). The FAQ answers
are honest about what isn't built yet (rate-table import, export tooling, full infra/DPA details) —
these all route to "ask in your walkthrough" until the product covers them. No market or traction
statistics are fabricated.
