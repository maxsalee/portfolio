/* ==========================================================================
   main.js — language switching, scroll-spy, mobile navigation, reveal
   No dependencies. Everything degrades gracefully if this file fails.
   ========================================================================== */

(function () {
  "use strict";

  var DICT = window.I18N;
  if (!DICT || !DICT.strings) return;

  var STORAGE_KEY = "cv-language";
  var THEME_KEY = "cv-theme";
  var DESKTOP_MIN = 1080;

  var html = document.documentElement;
  var sidebar = document.getElementById("sidebar");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var langButtons = Array.prototype.slice.call(document.querySelectorAll(".lang__btn"));

  /* ------------------------------------------------------------------ *
   * Storage helpers — localStorage throws in some file:// contexts,
   * so every access is guarded.
   * ------------------------------------------------------------------ */
  function readStored(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStored(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ *
   * Language
   * ------------------------------------------------------------------ */
  function isSupported(code) {
    return !!(code && DICT.strings[code]);
  }

  // English first, as specified. A previously chosen language is honoured,
  // but the browser's own language is deliberately NOT used to pick a default.
  function detectInitialLanguage() {
    var saved = readStored(STORAGE_KEY);
    if (isSupported(saved)) return saved;
    return DICT.defaultLang;
  }

  // Look the key up in the chosen language, then in English, so a
  // half-translated dictionary never blanks out an element.
  function translate(code, key) {
    var own = DICT.strings[code] ? DICT.strings[code][key] : undefined;
    if (typeof own === "string") return own;
    var fallback = DICT.strings[DICT.defaultLang][key];
    return typeof fallback === "string" ? fallback : null;
  }

  function applyLanguage(code, options) {
    if (!isSupported(code)) code = DICT.defaultLang;
    var persist = !options || options.persist !== false;

    var meta = null;
    for (var i = 0; i < DICT.langs.length; i++) {
      if (DICT.langs[i].code === code) { meta = DICT.langs[i]; break; }
    }
    if (!meta) meta = DICT.langs[0];

    html.setAttribute("lang", meta.htmlLang);
    html.setAttribute("data-lang", code);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var a = 0; a < nodes.length; a++) {
      var value = translate(code, nodes[a].getAttribute("data-i18n"));
      if (value !== null) nodes[a].textContent = value;
    }

    var contentNodes = document.querySelectorAll("[data-i18n-content]");
    for (var b = 0; b < contentNodes.length; b++) {
      var content = translate(code, contentNodes[b].getAttribute("data-i18n-content"));
      if (content !== null) contentNodes[b].setAttribute("content", content);
    }

    var labelNodes = document.querySelectorAll("[data-i18n-aria-label]");
    for (var c = 0; c < labelNodes.length; c++) {
      var label = translate(code, labelNodes[c].getAttribute("data-i18n-aria-label"));
      if (label !== null) labelNodes[c].setAttribute("aria-label", label);
    }

    var titleNodes = document.querySelectorAll("[data-i18n-title]");
    for (var t = 0; t < titleNodes.length; t++) {
      var hint = translate(code, titleNodes[t].getAttribute("data-i18n-title"));
      if (hint !== null) titleNodes[t].setAttribute("title", hint);
    }

    var title = translate(code, "meta.title");
    if (title !== null) document.title = title;

    for (var d = 0; d < langButtons.length; d++) {
      var isActive = langButtons[d].getAttribute("data-lang") === code;
      langButtons[d].setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    if (persist) writeStored(STORAGE_KEY, code);
  }

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  function closeNav() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initNav() {
    if (toggle && sidebar) {
      toggle.addEventListener("click", function () {
        var open = sidebar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", closeNav);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    // Clicking outside the panel closes it on mobile.
    document.addEventListener("click", function (event) {
      if (!sidebar || !sidebar.classList.contains("is-open")) return;
      if (sidebar.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= DESKTOP_MIN) closeNav();
    });
  }

  /* ------------------------------------------------------------------ *
   * Language switcher wiring
   * ------------------------------------------------------------------ */
  function initLanguage() {
    for (var i = 0; i < langButtons.length; i++) {
      langButtons[i].addEventListener("click", function () {
        applyLanguage(this.getAttribute("data-lang"));
        closeNav();
      });
    }
    applyLanguage(detectInitialLanguage(), { persist: false });
  }

  /* ------------------------------------------------------------------ *
   * Scroll-spy — highlights the section currently being read
   * ------------------------------------------------------------------ */
  function initScrollSpy() {
    var pairs = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute("href") || "";
      if (href.charAt(0) !== "#") continue;
      var section = document.getElementById(href.slice(1));
      if (section) pairs.push({ link: navLinks[i], section: section });
    }
    if (!pairs.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var line = window.innerHeight * 0.3;
      var current = pairs[0];

      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].section.getBoundingClientRect().top <= line) current = pairs[i];
      }

      // At the very bottom, always mark the last section.
      var atBottom =
        window.innerHeight + window.pageYOffset >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = pairs[pairs.length - 1];

      for (var j = 0; j < pairs.length; j++) {
        if (pairs[j] === current) {
          pairs[j].link.setAttribute("aria-current", "true");
        } else {
          pairs[j].link.removeAttribute("aria-current");
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add("is-visible");
            observer.unobserve(entries[i].target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    for (var j = 0; j < items.length; j++) observer.observe(items[j]);
  }

  /* ------------------------------------------------------------------ *
   * Theme — the initial value is set by the inline script in <head>,
   * which runs before first paint so there is no flash of the wrong
   * colours. Here we only wire up the button and keep things in sync.
   * ------------------------------------------------------------------ */
  function currentTheme() {
    var value = html.getAttribute("data-theme");
    return value === "dark" ? "dark" : "light";
  }

  function applyTheme(theme, options) {
    var persist = !options || options.persist !== false;
    html.setAttribute("data-theme", theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#101419" : "#fbfaf7");

    var button = document.querySelector(".theme-toggle");
    if (button) button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");

    if (persist) writeStored(THEME_KEY, theme);
  }

  function initTheme() {
    var button = document.querySelector(".theme-toggle");
    applyTheme(currentTheme(), { persist: false });
    if (!button) return;
    button.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ------------------------------------------------------------------ *
   * Download PDF — hands off to the browser's own print-to-PDF, which
   * produces selectable, searchable text. The print stylesheet strips
   * the sidebar and forces every scroll-revealed section visible.
   * ------------------------------------------------------------------ */
  function initPrint() {
    var buttons = document.querySelectorAll("[data-print]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        closeNav();
        window.print();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  function init() {
    initLanguage();
    initTheme();
    initPrint();
    initNav();
    initScrollSpy();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
