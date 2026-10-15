# Personal CV Website — Lee Cheuk Ki (Max Lee)

A single-page CV site built with plain HTML, CSS and JavaScript.

- **No build step** — no bundler, no npm install, no framework
- **No external requests** — system fonts only, so it works fully offline
- **Trilingual** — English (default), Traditional Chinese, Simplified Chinese
- **Light and dark themes** — follows your system setting, with a manual toggle
- **Download as PDF** — one button, or just press `Ctrl+P`
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
there is nothing to compile and no server-only feature. The page has no external
requests, so it renders and behaves identically from `file://`. The only thing
worth knowing is that a few browsers restrict `localStorage` on `file://` pages;
where that happens, a language or theme choice simply will not be remembered
between visits, and the page falls back to English and your system theme.

---

## Files

| Path | What it holds |
|---|---|
| `index.html` | All seven sections. Text carries `data-i18n="key"` attributes. |
| `css/styles.css` | Design tokens, layout, components, responsive rules, print rules. |
| `js/i18n.js` | Every translatable string, in all three languages. |
| `js/main.js` | Language switching, theme toggle, PDF button, scroll-spy, mobile menu, scroll reveal. |
| `server.js` | Tiny dependency-free static server for local preview. |
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

After editing, run the checker:

```powershell
node tools/check-i18n.js
```

It reports missing keys, unused keys, broken local links, and which strings are
falling back to English.

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

Nothing in `js/main.js` needs changing — it drives the buttons from the markup.

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
  buttons, the skip-link) uses `--on-accent`, not a hard-coded `#fff`.

If you change any colour, re-run:

```powershell
node tools/check-contrast.js
```

It checks every foreground/background pair the site actually uses — **in both
themes** — and exits non-zero if anything drops below the WCAG AA threshold
(4.5:1 for body text, 3:1 for large text). The current palettes pass everything.

---

## Downloading as a PDF

Click **Download PDF** in the sidebar (or press `Ctrl+P` anywhere). Both open the
browser's own print dialog; choose **Save as PDF** as the destination. Using the
browser rather than a JavaScript PDF library is deliberate: the text stays real,
selectable and searchable, and the page keeps its zero-dependency, offline design.

The print stylesheet automatically:

- switches to the light palette, so dark-mode visitors still get black-on-white paper
- hides the sidebar, navigation, language switcher, theme toggle and PDF button
- expands the content to the full page width
- forces every scroll-reveal section visible, even if you print before scrolling
- keeps cards, sections and list items from breaking awkwardly across pages

The result is roughly three A4 pages.

---

## Publishing

Nothing here is tied to a particular host. Any static host works.

**Fastest — Netlify Drop or Cloudflare Pages**
Open <https://app.netlify.com/drop> and drag the whole `portfolio` folder in.
You get a permanent public URL in about a minute, with no installs.

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

Education now lists both schools: **Evangel College, P1–S2 (2016–2024)** and
**Logos Academy, S3–S5 (2024–present)**.

Two lines were written for you and may need your confirmation:

- **Skills → Chinese: Native.** You only mentioned English, so this was inferred.
  Delete the row if it is not accurate.
- **Introduction:** *"…with a particular interest in physics and mathematics."*
  This was inferred from your S4 results and your choice of Physics for the EE.

Also worth adding when you have them: a GitHub link (which would substantiate the
Python and HTML claims), and a one-line tagline under your name.

---

## Browser support

Any current version of Chrome, Edge, Firefox or Safari. The JavaScript uses
`IntersectionObserver`, CSS custom properties and `requestAnimationFrame`.
If JavaScript is disabled or fails, all content is still fully readable — the
scroll-reveal effect is the only thing that depends on it, and it is skipped
entirely when the `js` class is absent.

`prefers-reduced-motion` is respected: reveal animations and smooth scrolling are
disabled for users who request it.
