/* ==========================================================================
   tools/build-site.js — assemble the deployable folder for Netlify.
   --------------------------------------------------------------------------
   Netlify needs a "publish directory". Publishing the project root would also
   publish files that must stay private — server.js, chat-core.js, the tools,
   .env.example, and especially "CV website draft.txt", which still contains
   the phone number, email and date of birth that were removed from the site.

   So this copies only the files a visitor should be able to fetch into dist/.
   It is not needed for local preview: server.js serves the root directly.
   Run it with:  node tools/build-site.js
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist");

// Everything a visitor may request. Nothing else is copied.
const PUBLIC = [
  "index.html",
  "css",
  "js",
  "cv-en.pdf",
  "cv-zh-Hant.pdf",
  "cv-zh-Hans.pdf",
  "qr-code.svg",
  "qr-code.png"
];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const copied = [];
for (const entry of PUBLIC) {
  const src = path.join(ROOT, entry);
  if (!fs.existsSync(src)) {
    console.warn("  skipped (missing): " + entry);
    continue;
  }
  fs.cpSync(src, path.join(OUT, entry), { recursive: true });
  copied.push(entry);
}

console.log("Built dist/ with " + copied.length + " entries:");
console.log("  " + copied.join("\n  "));
