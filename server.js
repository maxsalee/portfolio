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
   Optional .env loader — keeps OPENROUTER_KEY out of the code and out of
   the terminal history. Real environment variables always win.
   Create a .env file next to this one (see .env.example):
     OPENROUTER_KEY=sk-or-v1-...
     CHAT_MODEL=meta-llama/llama-3.3-70b-instruct:free
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
   ========================================================================== */

const OPENROUTER_KEY = process.env.OPENROUTER_KEY || "";
const CHAT_MODEL = process.env.CHAT_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// What the assistant is allowed to talk about. Update this whenever the
// CV changes — it is the bot's entire knowledge base.
const SYSTEM_PROMPT = [
  "You are the friendly CV chatbot on the personal website of Lee Cheuk Ki (Max Lee),",
  "a Secondary 5 student at The Hong Kong Chinese Christian Churches Union Logos Academy in Hong Kong.",
  "",
  "Facts you may use (never invent anything beyond them):",
  "- Contact: maxcklee.hk@gmail.com, phone +852 5629 7028, based in Hong Kong.",
  "- Interests: physics and mathematics; a critical thinker who enjoys solving problems.",
  "- Skills: Python (basic), HTML (basic), Microsoft Excel (experienced).",
  "- Languages: English (proficient), Cantonese (native).",
  "- Education: Logos Academy, 2024–present (S3–S5). 1st in form in Physics and Additional Mathematics (S4).",
  "- Stood in the student union election for Internal Vice Chair; outcome pending.",
  "- Selected to represent the school at the 2026 International Mathematical Modelling Challenge (IMMC),",
  "  and at the 2027 IMMC plus the 2027 PolyU Science Talents Competition.",
  "- Achievements: Third Honour in the 2026 Hong Kong Physics Olympiad; Go (Weiqi) 5 dan.",
  "- Work: intern at Sanfield (15–16 October 2026), learned AI-assisted development (vibecoding).",
  "- Projects: IB CAS project (science experiments for a children's community centre, in progress);",
  "  a planned 4,000-word IB Extended Essay in Physics (not started).",
  "- Hobbies: Go/Weiqi (12 years, 5 dan) and table tennis (2 years).",
  "",
  "Rules:",
  "- Answer only questions about Max, his CV, or how to contact him. If asked something else,",
  "  politely say it is outside your role and steer back to his CV.",
  "- Keep answers short (2–5 sentences) and factual. If a detail is not listed above, say it is",
  "  not published on the CV rather than guessing.",
  "- Reply in the same language the visitor writes in (English, Traditional Chinese, or Simplified Chinese).",
  "- You speak about Max in the third person; this is his CV seen through a visitor's eyes."
].join("\n");

// Naive per-IP rate limit: at most 8 requests per minute. Enough for a
// real visitor, not enough for someone to drain the quota.
const RATE_LIMIT = { windowMs: 60000, max: 8 };
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  if (hits.size > 500) hits.clear(); // do not let the map grow forever
  return entry.count > RATE_LIMIT.max;
}

function handleChat(req, res) {
  const ip = req.socket.remoteAddress || "unknown";

  if (!OPENROUTER_KEY) {
    return send(res, 503, JSON.stringify({ error: "Chat is not configured on this server." }), "application/json");
  }
  if (rateLimited(ip)) {
    return send(res, 429, JSON.stringify({ error: "Too many messages. Please wait a minute." }), "application/json");
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 8000) req.destroy(); // far more than a chat message needs
  });

  req.on("end", async () => {
    // Parse and sanitise what the browser sent.
    let incoming;
    try {
      incoming = JSON.parse(body);
    } catch (err) {
      return send(res, 400, JSON.stringify({ error: "Invalid JSON." }), "application/json");
    }
    if (!incoming || !Array.isArray(incoming.messages)) {
      return send(res, 400, JSON.stringify({ error: "Missing messages array." }), "application/json");
    }

    // The browser is not allowed to set its own system prompt.
    const messages = incoming.messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return send(res, 400, JSON.stringify({ error: "Conversation is empty." }), "application/json");
    }

    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 45000);

    try {
      const upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        signal: timeout.signal,
        headers: {
          "authorization": `Bearer ${OPENROUTER_KEY}`,
          "content-type": "application/json",
          "http-referer": process.env.SITE_URL || "http://127.0.0.1:4173",
          "x-title": "Max Lee — CV chatbot"
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          temperature: 0.6,
          max_tokens: 500,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages]
        })
      });

      const data = await upstream.json();
      res.writeHead(upstream.status, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data));
    } catch (err) {
      const reason = err.name === "AbortError" ? "The AI took too long to answer." : err.message;
      send(res, 502, JSON.stringify({ error: reason }), "application/json");
    } finally {
      clearTimeout(timer);
    }
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
  if (!OPENROUTER_KEY) {
    console.log("  Chatbot: disabled — OPENROUTER_KEY not found.");
    console.log("  Copy .env.example to .env and add your OpenRouter key to enable it.");
    console.log("");
  } else {
    console.log(`  Chatbot: enabled (model: ${CHAT_MODEL})`);
    console.log("");
  }
  console.log("  Press Ctrl+C to stop.");
  console.log("");
});
