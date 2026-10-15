#!/usr/bin/env node
/* ==========================================================================
   tools/build-pdf.js
   Rebuilds the downloadable CVs from index.html:

       cv-en.pdf        cv-zh-Hant.pdf        cv-zh-Hans.pdf

   Each file is rendered by headless Chrome or Edge, in the language given by
   ?lang=, using the site's own print stylesheet — so the PDF has real,
   selectable, searchable text and embedded CJK fonts.

   The website itself stays dependency-free. This script needs only Node and
   a browser that is already installed on the machine.

   Run:   node tools/build-pdf.js
   Also:  CHROME_PATH="C:\\path\\to\\chrome.exe" node tools/build-pdf.js

   Re-run it whenever the CV content changes, so the PDFs match the page.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..");

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["ProgramFiles"] && path.join(process.env["ProgramFiles"], "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env["ProgramFiles(x86)"] && path.join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const TARGETS = [
  { lang: "en", out: "cv-en.pdf" },
  { lang: "zh-Hant", out: "cv-zh-Hant.pdf" },
  { lang: "zh-Hans", out: "cv-zh-Hans.pdf" }
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8"
};

function findBrowser() {
  for (const candidate of BROWSERS) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// A throwaway static server, so one command does everything.
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url.split("?")[0];
      const relative = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
      const file = path.join(ROOT, path.normalize(relative));
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function render(browser, url, outPath, profileDir) {
  return new Promise((resolve, reject) => {
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=10000",
      "--no-pdf-header-footer",
      "--user-data-dir=" + profileDir,
      "--print-to-pdf=" + outPath,
      url
    ];
    const child = spawn(browser, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

function inspectPdf(file) {
  const buffer = fs.readFileSync(file);
  const text = buffer.toString("latin1");
  const counts = [...text.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return {
    bytes: buffer.length,
    header: text.slice(0, 8),
    eof: text.trimEnd().endsWith("%%EOF"),
    pages: counts.length ? Math.max(...counts) : 0,
    embeddedFonts: (text.match(/\/FontFile2/g) || []).length
  };
}

(async function main() {
  const browser = findBrowser();
  if (!browser) {
    console.error("No Chrome or Edge found. Set CHROME_PATH to the browser executable.");
    process.exit(1);
  }
  console.log("Browser :", browser);

  const server = await startServer();
  const port = server.address().port;
  console.log("Server  : http://127.0.0.1:" + port);
  console.log("");

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-pdf-"));
  let failed = 0;

  try {
    for (const target of TARGETS) {
      const url = "http://127.0.0.1:" + port + "/index.html?lang=" + encodeURIComponent(target.lang);
      const outPath = path.join(ROOT, target.out);
      try { fs.unlinkSync(outPath); } catch (e) { /* nothing to remove */ }

      const started = Date.now();
      await render(browser, url, outPath, profileDir);
      const seconds = ((Date.now() - started) / 1000).toFixed(1);

      if (!fs.existsSync(outPath)) {
        console.log("FAIL   " + target.out + "  (no file written after " + seconds + "s)");
        failed++;
        continue;
      }

      const info = inspectPdf(outPath);
      const good =
        info.header.startsWith("%PDF") && info.eof && info.pages > 0 && info.embeddedFonts > 0;
      if (!good) failed++;

      console.log(
        (good ? "OK     " : "FAIL   ") + target.out.padEnd(18) +
        String(info.pages).padStart(2) + " page(s)  " +
        String(info.bytes).padStart(7) + " bytes  " +
        String(info.embeddedFonts).padStart(2) + " embedded font(s)  " +
        seconds + "s"
      );
    }
  } finally {
    server.close();
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }

  console.log("");
  if (failed) {
    console.log(failed + " PDF(s) failed.");
    process.exitCode = 1;
  } else {
    console.log("All " + TARGETS.length + " PDFs rebuilt.");
  }
})();
