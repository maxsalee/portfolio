/* ==========================================================================
   netlify/functions/chat.js
   --------------------------------------------------------------------------
   The deployed counterpart to server.js's /api/chat. Netlify redirects
   /api/chat here (see netlify.toml), so the browser always calls the same
   path whether the site runs locally under server.js or on Netlify.

   The OpenRouter key is read from the environment (set it in Netlify under
   Site configuration → Environment variables as OPENROUTER_API_KEY). It is
   never exposed to the browser.

   All of the prompt, validation and reply scrubbing live in ../../chat-core.js
   so this file stays tiny and the local and deployed behaviour match.
   ========================================================================== */

"use strict";

const chat = require("../../chat-core.js");

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function reply(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return reply(405, { error: "Method not allowed" });
  }

  // Netlify puts the caller's IP in one of these headers.
  const headers = event.headers || {};
  const ip =
    headers["x-nf-client-connection-ip"] ||
    headers["x-forwarded-for"] ||
    headers["client-ip"] ||
    "unknown";

  if (chat.rateLimited(ip)) {
    return reply(429, { error: "Too many messages. Please wait a minute." });
  }

  let incoming;
  try {
    incoming = JSON.parse(event.body || "{}");
  } catch (err) {
    return reply(400, { error: "Invalid JSON." });
  }

  // Netlify's synchronous functions time out at 10s by default; ask the
  // upstream for an answer a little sooner so we can return a clean message.
  const result = await chat.generateReply(incoming && incoming.messages, {
    env: process.env,
    timeoutMs: 9000
  });

  return reply(result.status, result.body);
};
