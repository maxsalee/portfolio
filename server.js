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

/* ==========================================================================
   Optional .env loader — keeps the OpenRouter key out of the code and out of
   the terminal history. Real environment variables always win.
   Create a .env file next to this one (see .env.example):
     OPENROUTER_API_KEY=sk-or-v1-...
     CHAT_MODEL=google/gemma-4-26b-a4b-it:free
   ========================================================================== */
(function loadEnvFile() {
  try {
    const lines = fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (!match || match[1].startsWith("#")) continue;
      if (process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch (err) {
    /* No .env file is fine — the chatbot simply stays disabled. */
  }
})();

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

/* ==========================================================================
   /api/chat — small proxy to OpenRouter.
   The API key lives only on this machine; the browser never sees it.
   The prompt, validation and reply scrubbing live in chat-core.js so the
   local server and the Netlify Function stay identical.
   ========================================================================== */

const chat = require("./chat-core.js");
const CHAT = chat.getConfig();

function handleChat(req, res) {
  const ip = req.socket.remoteAddress || "unknown";

  if (!CHAT.key) {
    return send(res, 503, JSON.stringify({ error: "Chat is not configured on this server." }), "application/json");
  }
  if (chat.rateLimited(ip)) {
    return send(res, 429, JSON.stringify({ error: "Too many messages. Please wait a minute." }), "application/json");
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 8000) req.destroy(); // far more than a chat message needs
  });

  req.on("end", async () => {
    let incoming;
    try {
      incoming = JSON.parse(body);
    } catch (err) {
      return send(res, 400, JSON.stringify({ error: "Invalid JSON." }), "application/json");
    }

    const result = await chat.generateReply(incoming && incoming.messages);
    send(res, result.status, JSON.stringify(result.body), "application/json");
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch (err) {
    return send(res, 400, "Bad request");
  }

  if (pathname === "/" || pathname === "") pathname = "/index.html";

  // The CV chatbot endpoint (never served as a file).
  if (pathname === "/api/chat") {
    if (req.method !== "POST") return send(res, 405, "Method not allowed");
    return handleChat(req, res);
  }

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
  if (!CHAT.key) {
    console.log("  Chatbot: disabled — OPENROUTER_API_KEY not found.");
    console.log("  Copy .env.example to .env and add your OpenRouter key to enable it.");
    console.log("");
  } else {
    console.log(`  Chatbot: enabled (model: ${CHAT.model})`);
    console.log("");
  }
  console.log("  Press Ctrl+C to stop.");
  console.log("");
});
