/* ==========================================================================
   tools/check-contrast.js
   Checks every foreground/background colour pair this site actually uses
   against the WCAG 2.1 contrast thresholds — in BOTH themes.

   Run with:  node tools/check-contrast.js
   ========================================================================== */

// --- WCAG relative luminance -------------------------------------------
function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// --- Palettes, mirroring the custom properties in css/styles.css --------
const LIGHT = {
  bg: "#fbfaf7",
  surface: "#ffffff",
  ink: "#141c24",
  inkSoft: "#586472",
  inkFaint: "#67707c",
  accent: "#1b5c8f",
  accentDeep: "#144a72",
  accentTint: "#eef4f9",
  ruleSoft: "#f1eee8",
  onAccent: "#ffffff",
  warm: "#9c5b23",
  warmTint: "#fdf3e7",
  ok: "#1f6b40",
  okTint: "#eaf5ee",
  wait: "#7a6130",
  waitTint: "#f6f2e7"
};

const DARK = {
  bg: "#101419",
  surface: "#181e25",
  ink: "#e9edf1",
  inkSoft: "#adb7c2",
  inkFaint: "#8e98a4",
  accent: "#6cb0e2",
  accentDeep: "#8cc5ee",
  accentTint: "#1b2836",
  ruleSoft: "#222932",
  onAccent: "#0c1218",
  warm: "#e3ab72",
  warmTint: "#2c2318",
  ok: "#6fc79b",
  okTint: "#14261d",
  wait: "#dcc07e",
  waitTint: "#2a2416"
};

// --- Every pair in use. min = 4.5 for body text, 3 for large text only --
function pairsFor(C) {
  return [
    ["body / headings on page",     C.ink,       C.bg,         4.5],
    ["body / headings on card",     C.ink,       C.surface,    4.5],
    ["secondary text on page",      C.inkSoft,   C.bg,         4.5],
    ["secondary text on card",      C.inkSoft,   C.surface,    4.5],
    ["faint labels on page",        C.inkFaint,  C.bg,         4.5],
    ["faint labels on card",        C.inkFaint,  C.surface,    4.5],
    ["section number on page",      C.accent,    C.bg,         4.5],
    ["contact link on page",        C.accentDeep, C.bg,        4.5],
    ["nav link on page",            C.inkSoft,   C.bg,         4.5],
    ["nav link active",             C.accentDeep, C.accentTint, 4.5],
    ["skill chip",                  C.accentDeep, C.accentTint, 4.5],
    ["soft chip",                   C.inkSoft,   C.ruleSoft,   4.5],
    ["status: in progress",         C.ok,        C.okTint,     4.5],
    ["status: not started",         C.wait,      C.waitTint,   4.5],
    ["todo badge",                  C.warm,      C.warmTint,   4.5],
    ["active language button",      C.onAccent,  C.accent,     4.5],
    ["theme + pdf button label",    C.inkSoft,   C.surface,    4.5],
    ["academic rank on card",       C.accentDeep, C.surface,   4.5],
    ["footer link on page",         C.accentDeep, C.bg,        4.5],
    ["focus ring vs page",          C.accent,    C.bg,         3.0]
  ];
}

let failures = 0;

for (const [name, palette] of [["LIGHT", LIGHT], ["DARK", DARK]]) {
  console.log(`\n=== ${name} THEME ===\n`);

  for (const [label, fg, bg, min] of pairsFor(palette)) {
    const r = ratio(fg, bg);
    const pass = r >= min;
    if (!pass) failures++;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min.toFixed(1)})  ` +
        `${label.padEnd(28)} ${fg} on ${bg}`
    );
  }
}

// --- Guard against hard-coded black/white TEXT in the screen styles ------
// Text sitting on --accent must use --on-accent, because the accent is dark
// in light mode and light in dark mode. A hard-coded #fff is correct in light
// mode and unreadable in dark mode — which is exactly how the skip-link broke.
// The print block is excluded: it deliberately forces black-on-white paper.
const fs = require("fs");
const path = require("path");
const cssPath = path.join(__dirname, "..", "css", "styles.css");
const css = fs.readFileSync(cssPath, "utf8");
const printAt = css.indexOf("@media print");
const screenCss = printAt === -1 ? css : css.slice(0, printAt);

const offenders = [];
screenCss.split(/\r?\n/).forEach((line, i) => {
  if (/(?:^|[;{\s])color:\s*#(?:fff|ffffff|000|000000)\b/i.test(line)) {
    offenders.push(`  line ${i + 1}: ${line.trim()}`);
  }
});

console.log("");
if (offenders.length) {
  console.log("Hard-coded black/white text colours found in the screen styles:");
  offenders.forEach((o) => console.log(o));
  console.log("  Use var(--ink) / var(--on-accent) instead so dark mode stays readable.");
  failures += offenders.length;
}

if (failures) {
  console.log(`\n${failures} problem(s) found.`);
  process.exitCode = 1;
} else {
  console.log("All pairs meet their WCAG threshold in both themes, and no");
  console.log("hard-coded black/white text colours remain in the screen styles.");
}
