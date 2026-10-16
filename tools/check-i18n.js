// Temporary integrity check — compares data-i18n keys in index.html
// against every language in js/i18n.js. Not part of the site.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

global.window = {};
require(path.join(root, "js", "i18n.js"));
const I18N = global.window.I18N;

const keysInHtml = new Set();
for (const attr of ["data-i18n", "data-i18n-content", "data-i18n-aria-label", "data-i18n-title", "data-i18n-placeholder"]) {
  const re = new RegExp(attr + '="([^"]+)"', "g");
  let m;
  while ((m = re.exec(html))) keysInHtml.add(m[1]);
}

const langCodes = I18N.langs.map((l) => l.code);
const problems = [];

// 1. every HTML key must resolve through the fallback chain
for (const key of keysInHtml) {
  for (const code of langCodes) {
    const own = I18N.strings[code] && I18N.strings[code][key];
    const fallback = I18N.strings[I18N.defaultLang][key];
    if (own === undefined && fallback === undefined) {
      problems.push(`MISSING  ${code}  ${key}`);
    }
  }
}

// 2. report keys that fall back to English, so silent English text is visible
const usingFallback = [];
for (const code of langCodes) {
  if (code === I18N.defaultLang) continue;
  for (const key of keysInHtml) {
    if (I18N.strings[code][key] === undefined) usingFallback.push(`${code} ${key}`);
  }
}

// 3. unused dictionary keys. main.js and chat.js read a few keys through
//    variables (the greeting wording, the weather descriptions, the chat
//    bubbles), so collect both translate(<x>, "key") calls and any dotted
//    string literal.
const mainJs = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
const chatJs = fs.readFileSync(path.join(root, "js", "chat.js"), "utf8");
const keysInJs = new Set(
  [mainJs, chatJs].flatMap((code) => [
    ...code.matchAll(/translate\([^,]+,\s*"([^"]+)"/g).map((m) => m[1]),
    ...code.matchAll(/t\("([^"]+)"/g).map((m) => m[1]),
    ...code.matchAll(/"([a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+)"/g).map((m) => m[1])
  ])
);
const unused = [];
for (const key of Object.keys(I18N.strings[I18N.defaultLang])) {
  if (!keysInHtml.has(key) && !keysInJs.has(key)) unused.push(key);
}

// 4. duplicate data-i18n keys are fine, but report ids referenced by nav
const ids = new Set();
const idRe = /id="([^"]+)"/g;
let m;
while ((m = idRe.exec(html))) ids.add(m[1]);
const navTargets = [...html.matchAll(/class="nav__link" href="#([^"]+)"/g)].map((x) => x[1]);
for (const t of navTargets) if (!ids.has(t)) problems.push(`NAV TARGET NOT FOUND  #${t}`);

// 5. local asset references exist
for (const ref of [...html.matchAll(/(?:href|src)="((?!data:|#|mailto:|tel:|https?:)[^"]+)"/g)].map((x) => x[1])) {
  if (!fs.existsSync(path.join(root, ref))) problems.push(`BROKEN REF  ${ref}`);
}

console.log("HTML i18n keys used :", keysInHtml.size);
console.log("Languages           :", langCodes.join(", "));
console.log("Dictionary keys (en) :", Object.keys(I18N.strings[I18N.defaultLang]).length);
console.log("");
console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "problems            : none");
console.log("");
console.log(
  usingFallback.length
    ? "Falling back to English (" + usingFallback.length + "):\n  " + usingFallback.join("\n  ")
    : "Falling back to English: none (every language defines every key)"
);
console.log("");
console.log(unused.length ? "Unused dictionary keys: " + unused.join(", ") : "Unused dictionary keys  : none");
