/* ==========================================================================
   server.js — tiny static file server for local preview
   No dependencies. Run with:  node server.js
   Then open:                  http://127.0.0.1:4173
   ========================================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 4173;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2"
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "content-type": type || "text/plain; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch (err) {
    return send(res, 400, "Bad request");
  }

  if (pathname === "/" || pathname === "") pathname = "/index.html";

  const filePath = path.join(ROOT, pathname);

  // Refuse anything that escapes the project folder.
  const relative = path.relative(ROOT, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return send(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return send(res, 404, `404 — not found: ${pathname}`);
    }
    const type = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
    send(res, 200, data, type);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Try a different one:  $env:PORT=4180; node server.js`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  CV site is running:");
  console.log(`  http://${HOST}:${PORT}/`);
  console.log("");
  console.log("  Press Ctrl+C to stop.");
  console.log("");
});