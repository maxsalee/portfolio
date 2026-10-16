/* ==========================================================================
   chat.js — the CV chatbot widget.
   --------------------------------------------------------------------------
   Talks to /api/chat on this site's own server, which is where the
   OpenRouter key lives. This file never sees the key and never talks to
   OpenRouter directly. If the endpoint is unavailable the widget says so
   instead of failing silently.

   Model output is always written with textContent (never innerHTML), so a
   reply can not inject markup into the page.
   ========================================================================== */

(function () {
  "use strict";

  var DICT = window.I18N;
  var MAX_MESSAGE_CHARS = 1000;   // matches the server-side cap
  var MAX_HISTORY = 20;           // messages sent back for context

  var root = document.getElementById("chat");
  var fab = document.getElementById("chat-fab");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var send = document.getElementById("chat-send");
  var status = document.getElementById("chat-status");

  if (!root || !fab || !panel || !log || !form || !input || !send) return;
  if (!window.fetch) return; // no fetch: leave the widget out entirely

  // The whole conversation. The server prepends its own system prompt.
  var history = [];
  var greeted = false;
  var busy = false;

  /* ------------------------------------------------------------------ *
   * Text helpers
   * ------------------------------------------------------------------ */
  function t(key, fallback) {
    var lang = document.documentElement.getAttribute("data-lang") || (DICT && DICT.defaultLang) || "en";
    if (DICT && DICT.strings) {
      var own = DICT.strings[lang] && DICT.strings[lang][key];
      if (typeof own === "string") return own;
      var base = DICT.strings[DICT.defaultLang] && DICT.strings[DICT.defaultLang][key];
      if (typeof base === "string") return base;
    }
    return fallback || "";
  }

  function currentLangCode() {
    return document.documentElement.getAttribute("data-lang") || (DICT && DICT.defaultLang) || "en";
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */
  function bubble(text, who) {
    var el = document.createElement("p");
    el.className = "chat__msg chat__msg--" + who;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function paintWelcome() {
    log.textContent = "";
    bubble(t("chat.welcome", "Hi! Ask me anything about Max's CV."), "bot");
    greeted = true;
  }

  function setBusy(value) {
    busy = value;
    send.disabled = value;
    input.disabled = value;
    status.hidden = !value;
    if (value) log.scrollTop = log.scrollHeight;
    else input.focus();
  }

  function openPanel() {
    panel.hidden = false;
    root.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    if (!greeted) paintWelcome();
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    root.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  function grow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 96) + "px";
  }

  /* ------------------------------------------------------------------ *
   * Sending
   * ------------------------------------------------------------------ */
  function sendMessage() {
    if (busy) return;

    var text = input.value.replace(/\s+$/, "").trim();
    if (!text) return;
    if (text.length > MAX_MESSAGE_CHARS) text = text.slice(0, MAX_MESSAGE_CHARS);

    input.value = "";
    grow();
    bubble(text, "user");

    history.push({ role: "user", content: text });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    setBusy(true);

    window.fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history, lang: currentLangCode() })
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, status: response.status, data: data };
        });
      })
      .then(function (result) {
        var data = result.data || {};
        var reply =
          data.choices && data.choices[0] && data.choices[0].message &&
          typeof data.choices[0].message.content === "string"
            ? data.choices[0].message.content.trim()
            : "";

        if (!result.ok || !reply) {
          // Surface the server's own message when it has one; those are
          // written for visitors, unlike an API error blob.
          var apiError = data.error && typeof data.error === "string" ? data.error : "";
          throw new Error(apiError || "unavailable");
        }

        bubble(reply, "bot");
        history.push({ role: "assistant", content: reply.slice(0, 1200) });
        if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

        // The last user turn is already stored; nothing else to do.
        setBusy(false);
      })
      .catch(function () {
        // Drop the failed turn so a retry does not stack up duplicates.
        history.pop();
        bubble(t("chat.error", "Sorry, something went wrong. Please try again."), "error");
        setBusy(false);
      });
  }

  /* ------------------------------------------------------------------ *
   * Wiring
   * ------------------------------------------------------------------ */
  root.hidden = false; // markup ships hidden so no-JS visitors never see it

  fab.addEventListener("click", function () {
    if (root.classList.contains("is-open")) closePanel();
    else openPanel();
  });

  if (closeBtn) closeBtn.addEventListener("click", closePanel);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.classList.contains("is-open")) closePanel();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage();
  });

  input.addEventListener("input", grow);

  input.addEventListener("keydown", function (event) {
    // Enter sends; Shift+Enter makes a new line.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  /* When the visitor switches language, refresh the strings this file
     wrote itself. Values owned by data-i18n attributes are handled by
     main.js. */
  var observer = null;
  try {
    observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].attributeName !== "data-lang") continue;
        if (history.length === 0) paintWelcome();
        return;
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
  } catch (e) { /* very old browser: the welcome text simply keeps its first language */ }
})();
