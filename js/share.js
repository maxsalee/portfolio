/* ==========================================================================
   share.js — the "Share" dialog.
   --------------------------------------------------------------------------
   Opened by the Share button that sits next to Download PDF. It offers two
   ways to pass the CV on: a copyable link, and a QR code for a phone camera.
   The link is fixed here because it is the site's public address; both the
   input value and the QR image are also written in index.html, so no-JS
   visitors who reach the markup still see something sensible.
   ========================================================================== */

(function () {
  "use strict";

  var DICT = window.I18N;
  var SHARE_URL = "https://maxsalee-portfolio.netlify.app/";

  var root = document.getElementById("share");
  var openBtn = document.getElementById("share-btn");
  var panel = document.getElementById("share-panel");
  var backdrop = document.getElementById("share-backdrop");
  var closeBtn = document.getElementById("share-close");
  var linkInput = document.getElementById("share-link");
  var copyBtn = document.getElementById("share-copy");
  var statusEl = document.getElementById("share-status");

  if (!root || !openBtn || !panel) return;

  var lastFocus = null;
  var resetTimer = 0;

  /* ------------------------------------------------------------------ *
   * Text helper — same fallback chain main.js/chat.js use, so a
   * half-translated dictionary never shows an empty label.
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

  function setStatus(message) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    window.clearTimeout(resetTimer);
    if (message) {
      resetTimer = window.setTimeout(function () { statusEl.textContent = ""; }, 2500);
    }
  }

  /* ------------------------------------------------------------------ *
   * Open / close
   * ------------------------------------------------------------------ */
  function open() {
    lastFocus = document.activeElement;
    root.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    if (linkInput) linkInput.value = SHARE_URL;
    // Land the keyboard on the most useful control.
    var first = copyBtn || closeBtn || panel;
    if (first && first.focus) first.focus();
  }

  function close() {
    root.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    if (statusEl) statusEl.textContent = "";
    var target = lastFocus && lastFocus.focus ? lastFocus : openBtn;
    try { target.focus(); } catch (e) { openBtn.focus(); }
  }

  function isOpen() {
    return !root.hidden;
  }

  /* ------------------------------------------------------------------ *
   * Copy the link
   * ------------------------------------------------------------------ */
  function fallbackCopy(text) {
    // Older browsers, and any context without the async clipboard API.
    if (!linkInput) return false;
    try {
      linkInput.focus();
      linkInput.select();
      linkInput.setSelectionRange(0, text.length);
      return document.execCommand("copy");
    } catch (e) {
      return false;
    }
  }

  function copyLink() {
    var text = SHARE_URL;

    function done(ok) {
      setStatus(ok ? t("share.copied", "Link copied") : t("share.copyError", "Press Ctrl+C to copy"));
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () {
        done(fallbackCopy(text));
      });
    } else {
      done(fallbackCopy(text));
    }
  }

  /* ------------------------------------------------------------------ *
   * Wiring
   * ------------------------------------------------------------------ */
  openBtn.addEventListener("click", function () {
    if (isOpen()) close();
    else open();
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  if (copyBtn) copyBtn.addEventListener("click", copyLink);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) close();
  });

  // Clicking the dark surround (not the panel) closes the dialog.
  root.addEventListener("mousedown", function (event) {
    if (event.target === root) close();
  });
})();
