# Personal CV Website — Lee Cheuk Ki (Max Lee)

A single-page CV site built with plain HTML, CSS and JavaScript.

- **No build step** — no bundler, no npm install, no framework
- **Trilingual** — English (default), Traditional Chinese, Simplified Chinese
- **Light and dark themes** — follows your system setting, with a manual toggle
- **Adjustable text size** — A− / 100% / A+, remembered between visits
- **Downloads a real PDF** — a genuine, selectable-text PDF file, one per language
- **Reads well on screen** — time-of-day greeting with live local weather, a
  reading-progress bar, a back-to-top button and a footer contents list
- **Accessible** — Lighthouse 100 / 100 / 100 (accessibility, best practices, SEO)

---

## Quick start

```powershell
node server.js
```

Then open <http://127.0.0.1:4173>.

To stop the server, press `Ctrl+C`. To use a different port:

```powershell
$env:PORT=4180; node server.js
```

You can also just double-click `index.html` to open it directly in a browser —
there is nothing to compile and no server-only feature. The page renders and
behaves the same from `file://`, including the live weather. The only things worth
knowing are that a few browsers restrict `localStorage` on `file://` pages (where
that happens, a language, theme or text-size choice is simply not remembered, and
the page falls back to English and your system theme), and that geolocation needs a
secure context, so on `file://` the weather stays on Hong Kong.

---

## Files

| Path | What it holds |
|---|---|
| `index.html` | All seven sections. Text carries `data-i18n="key"` attributes. |
| `css/styles.css` | Design tokens, layout, components, responsive rules, print rules. |
| `js/i18n.js` | Every translatable string, in all three languages. |
| `js/main.js` | Language, theme, text size, greeting + weather, progress bar, back-to-top, scroll-spy, mobile menu, scroll reveal. |
| `cv-en.pdf`, `cv-zh-Hant.pdf`, `cv-zh-Hans.pdf` | The downloadable CVs, one per language. Generated, not hand-written. |
| `server.js` | Tiny dependency-free static server for local preview. |
| `tools/build-pdf.js` | Rebuilds the three PDFs with headless Chrome or Edge. |
| `tools/check-i18n.js` | Verifies every key used in the HTML exists in every language. |
| `tools/check-contrast.js` | Checks all colour pairs against WCAG contrast thresholds, in both themes. |
| `CV website draft.txt` | Your original notes, kept untouched for reference. |

The seven sections are, in order: **Introduction, Skills, Education,
Achievements, Work Experience, Project Experience, Hobbies.**

---

## Editing the content

Text lives in two places.

1. **`index.html`** holds the markup and the English fallback text.
2. **`js/i18n.js`** holds the translations.

Every translatable element looks like this:

```html
<h2 class="section__title" data-i18n="nav.skills">Skills</h2>
```

To change wording, edit the matching key in each language inside `js/i18n.js`:

```js
"nav.skills": "Skills",     // en
"nav.skills": "技能",        // zh-Hant
"nav.skills": "技能"         // zh-Hans
```

Four attribute types are supported:

| Attribute | Effect |
|---|---|
| `data-i18n="key"` | Replaces the element's text |
| `data-i18n-content="key"` | Sets the `content` attribute (used by `<meta name="description">`) |
| `data-i18n-aria-label="key"` | Sets `aria-label`, for screen readers |
| `data-i18n-title="key"` | Sets `title`, the tooltip on hover |

**A missing key falls back to English**, so a partly translated file never
blanks out an element. That is why a few keys (`Python`, `HTML`,
`Microsoft Excel`) are intentionally absent from the Chinese blocks — those
product names are identical in every language.

A couple of strings are chosen at run time rather than written in the markup:
the greeting (`greet.morning` / `greet.afternoon` / `greet.evening`) and the
weather descriptions (`weather.*`). `js/main.js` holds them as a lookup table, so
the checker can still see them.

After editing, run the checker:

```powershell
node tools/check-i18n.js
```

It reports missing keys, unused keys, broken local links, and which strings are
falling back to English.

**If you change anything a visitor can read, rebuild the PDFs too** (see
[Downloading as a PDF](#downloading-as-a-pdf)) so the downloads match the page.

### Adding a fourth language

1. Add an entry to `langs` in `js/i18n.js`:
   ```js
   { code: "ja", label: "日", htmlLang: "ja" }
   ```
2. Add a `"ja": { ... }` block to `strings` with your translations.
3. Add a button in `index.html` inside `.lang`:
   ```html
   <button type="button" class="lang__btn" data-lang="ja" aria-pressed="false" lang="ja" title="日本語">日</button>
   ```
4. Add the language to `PDFS` in `js/main.js`, and add a target to `TARGETS` in
   `tools/build-pdf.js`, then rebuild the PDFs.

Nothing else in `js/main.js` needs changing — it drives the buttons from the markup.

---

## Light and dark themes

The theme is decided in this order:

1. A choice the visitor made before, saved in `localStorage` under `cv-theme`.
2. Otherwise the operating system's `prefers-color-scheme` setting.
3. Otherwise light.

The choice is applied by a short inline script in `<head>`, **before the first
paint**, so there is never a flash of the wrong colours. The sidebar toggle flips
it and remembers the result. `<meta name="theme-color">` is kept in step so the
browser chrome matches.

---

## Text size

The `A−` / `100%` / `A+` control scales every font on the page. It sets a single
multiplier, `--fs` on `:root`, and every `font-size` in the stylesheet is written
as `calc(<base> * var(--fs))`. Because line-heights are unitless, they scale too.

- Range **90% – 150%, in 10% steps**; the readout shows the current value.
- Saved in `localStorage` under `cv-text-scale`.
- Applied by the same inline `<head>` script, so text never jumps after load.
- The buttons disable themselves at the minimum and maximum.

If you add a `font-size` anywhere, write it as `calc(<value> * var(--fs))` so it
takes part in the scaling.

---

## Greeting and weather

Above the introduction, a line greets the visitor and, when possible, reports the
current weather. It is hidden when printing.

- **Greeting** — from the visitor's own clock: *morning* 03:00–11:59,
  *afternoon* 12:00–17:59, *evening* 18:00–02:59. It re-checks every minute, so it
  stays correct if the page is left open.
- **Weather** — [Open-Meteo](https://open-meteo.com/), which needs no API key.
  The location defaults to **Hong Kong**.
- **Device location** — only used if the visitor has *already* granted permission.
  Otherwise a discreet **Use my location** button appears; if permission was
  denied before, no button is shown and Hong Kong is kept.
- The place name is taken from the API's timezone, reduced to letters and digits,
  and written with `textContent`. API values are never treated as markup and the
  temperature is validated as a number before use.
- If the request fails or is offline, the greeting simply appears on its own.

**This is the site's only external request.** It sends the coordinates (Hong Kong
by default) to `api.open-meteo.com`. If you would rather have no network traffic at
all, delete the `loadWeather(...)` call in `initGreeting()` and the greeting will
keep working with just the time of day.

---

## Reading progress, back to top, contents

- A hairline **progress bar** across the top fills as the page is scrolled.
- A **back-to-top** button appears after ~320px of scrolling. It is sized with
  `clamp()`, so it stays proportional from phone to desktop, and it moves keyboard
  focus to the top of the main content rather than only scrolling.
- The footer carries a **contents list** linking to all seven sections.
- A **skip link** is the first thing a keyboard user reaches; it jumps to `#main`.

All of these are hidden when printing.

---

## Downloading as a PDF

The **Download PDF** button is a plain link to a real PDF file:

| Language | File | Saved as |
|---|---|---|
| English | `cv-en.pdf` | `Lee-Cheuk-Ki-CV.pdf` |
| Traditional Chinese | `cv-zh-Hant.pdf` | `Lee-Cheuk-Ki-CV-zh-Hant.pdf` |
| Simplified Chinese | `cv-zh-Hans.pdf` | `Lee-Cheuk-Ki-CV-zh-Hans.pdf` |

`js/main.js` repoints the link at the matching file when the language changes, so
pressing it always saves the CV in the language you are reading. Even with
JavaScript disabled, the link still works and serves the English PDF.

Each PDF is **3 A4 pages** with real, selectable, searchable text and embedded
fonts (including the Chinese glyphs) — not an image, and not a screenshot of the
page. `Ctrl+P` still works as before if you prefer the print dialog.

### Rebuilding them

The PDFs are generated from `index.html` itself, using Chrome's own print engine
and the site's print stylesheet, so they stay in step with the design:

```powershell
node tools/build-pdf.js
```

It starts a throwaway local server, renders
`index.html?lang=<language>` for each of the three languages in headless Chrome or
Edge, writes the PDFs into this folder, and reports the page count, size and
embedded-font count for each. Re-run it whenever you change the content.

Only Node and an installed Chrome or Edge are needed — the site itself still has no
dependencies, and nothing is added to the page at run time. If the browser is
somewhere unusual, point at it explicitly:

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"; node tools/build-pdf.js
```

The print stylesheet:

- forces the light palette, so dark-mode visitors still get black-on-white paper
- sets A4 and 14mm margins (`@page { size: A4 }`)
- hides the sidebar, controls, greeting, progress bar, back-to-top button, skip
  link and footer contents list
- makes cards and boxed lists single-column so they line up down the page
- keeps cards, list rows and timeline entries from splitting across pages, while
  letting the long sections flow, which avoids the large gaps that
  `break-inside: avoid` on whole sections used to cause
- tightens Chinese leading on paper, where the generous on-screen spacing is not
  needed

---

## URL parameters

| Parameter | Effect |
|---|---|
| `?lang=en` \| `?lang=zh-Hant` \| `?lang=zh-Hans` | Renders in that language **for this visit only**; it is not saved. Handy for sharing a link, and it is how the PDF builder renders each language. |

---

## Changing the colours

Colours are custom properties at the top of `css/styles.css`, in two blocks: the
`:root` defaults (light) and an `html[data-theme="dark"]` override.

```css
:root {
  --bg:          #fbfaf7;   /* page background */
  --ink:         #141c24;   /* headings, primary text */
  --ink-soft:    #586472;   /* body text */
  --ink-faint:   #67707c;   /* small labels and metadata */
  --accent:      #1b5c8f;   /* the single accent colour */
  --on-accent:   #ffffff;   /* text sitting on top of --accent */
}

html[data-theme="dark"] {
  --bg:          #101419;
  --ink:         #e9edf1;
  --accent:      #6cb0e2;   /* lightened: the light navy fails on a dark bg */
  --on-accent:   #0c1218;   /* near-black, because the accent is now light */
  /* … */
}
```

Two details matter if you edit these:

- `--on-accent` **flips** between themes. The accent is dark in light mode and
  light in dark mode, so text sitting on it has to invert. Getting this wrong was
  the source of a real bug on the skip-link.
- Anything that inherits the accent (the active language pill, the theme and PDF
  buttons, the back-to-top button, the skip-link) uses `--on-accent`, not a
  hard-coded `#fff`.

If you change any colour, re-run:

```powershell
node tools/check-contrast.js
```

It checks every foreground/background pair the site actually uses — **in both
themes** — and exits non-zero if anything drops below the WCAG AA threshold
(4.5:1 for body text, 3:1 for large text and UI boundaries). The current palettes
pass everything.

---

## Publishing

Nothing here is tied to a particular host. Any static host works.

**Fastest — Netlify Drop or Cloudflare Pages**
Open <https://app.netlify.com/drop> and drag the whole `portfolio` folder in.
You get a permanent public URL in about a minute, with no installs. The
pre-built PDFs go up with the rest of the files, so the download button works
immediately.

**GitHub Pages**
This machine has no `git` installed. You would need to install Git first, then:

```powershell
git init
git add .
git commit -m "Personal CV site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Then enable Pages under Settings → Pages → Source: `main` / root.

**Before you publish**, remember that your phone number and email are visible in
plain text in `index.html`, so they will be readable by scrapers once the page is
indexed. That was your explicit choice. If you change your mind, the cleanest
fix is to delete the phone `<div class="info__item">` block and keep the email.

---

## Outstanding content to fill in

The site currently shows small orange **`To fill in` / `待補充`** badges wherever
information is still missing. Search `index.html` for `class="todo"` to find them
all, and delete each `<span class="todo" ...>` once the content is real.

| Where | What is needed |
|---|---|
| Education | The student union election result, once known. |
| Work Experience | What you actually built with vibecoding during the Sanfield internship. |
| Project Experience | The IB EE research topic, once chosen. |
| Achievements | The names of the Go competitions you entered. |
| Hobbies | Go competition names, and any table tennis school-team or competition record. |

Two lines were written for you and may need your confirmation:

- **Skills → Cantonese: Native.** You only mentioned English, so this was inferred.
  Delete the row if it is not accurate.
- **Introduction:** *"…with a particular interest in physics and mathematics."*
  This was inferred from your S4 results and your choice of Physics for the EE.

Also worth adding when you have them: a GitHub link (which would substantiate the
Python and HTML claims), and a one-line tagline under your name.

---

## Browser support

Any current version of Chrome, Edge, Firefox or Safari. The JavaScript uses
`IntersectionObserver`, CSS custom properties, `fetch` and `requestAnimationFrame`,
each of which is feature-checked or degrades on its own. If JavaScript is disabled
or fails, all content is still fully readable, the language buttons are the
fallback English text, the PDF link still serves the English PDF, and only the
greeting, progress bar, back-to-top button and scroll-reveal effect are lost.

`prefers-reduced-motion` is respected: reveal animations, the progress bar's
transitions and smooth scrolling are all disabled for users who request it (the
reduced-motion block sets `html { scroll-behavior: auto }`, which also makes the
back-to-top button jump instantly).
