/* ==========================================================================
   main.js — language, theme, text size, greeting + weather, reading
   progress, back-to-top, mobile navigation, scroll-spy and reveal.
   No dependencies. Everything degrades gracefully if this file fails.
   ========================================================================== */

(function () {
  "use strict";

  var DICT = window.I18N;
  if (!DICT || !DICT.strings) return;

  var STORAGE_KEY = "cv-language";
  var THEME_KEY = "cv-theme";
  var TEXT_KEY = "cv-text-scale";
  var DESKTOP_MIN = 1080;

  // Text size is a multiplier on every font size on the page.
  var TEXT_MIN = 0.9;
  var TEXT_MAX = 1.5;
  var TEXT_STEP = 0.1;

  // Where to show the weather when the visitor's own location is unknown.
  var HOME = { lat: 22.3193, lon: 114.1694 };

  // The greeting uses the device's local time.
  //   morning   03:00 – 11:59
  //   afternoon 12:00 – 17:59
  //   evening   18:00 – 02:59
  var GREETING_KEYS = {
    morning: "greet.morning",
    afternoon: "greet.afternoon",
    evening: "greet.evening"
  };

  // WMO weather codes, as returned by Open-Meteo, mapped to dictionary keys.
  var WEATHER_KEYS = {
    0: "weather.clear", 1: "weather.mainlyClear", 2: "weather.partlyCloudy", 3: "weather.cloudy",
    45: "weather.fog", 48: "weather.fog",
    51: "weather.drizzle", 53: "weather.drizzle", 55: "weather.drizzle",
    56: "weather.drizzle", 57: "weather.drizzle",
    61: "weather.rain", 63: "weather.rain", 65: "weather.rain", 66: "weather.rain", 67: "weather.rain",
    71: "weather.snow", 73: "weather.snow", 75: "weather.snow", 77: "weather.snow",
    80: "weather.showers", 81: "weather.showers", 82: "weather.showers",
    85: "weather.snow", 86: "weather.snow",
    95: "weather.thunder", 96: "weather.thunder", 99: "weather.thunder"
  };

  // One PDF per language: js/download just points the link at the right file.
  var PDFS = {
    "en": { file: "cv-en.pdf", name: "Lee-Cheuk-Ki-CV.pdf" },
    "zh-Hant": { file: "cv-zh-Hant.pdf", name: "Lee-Cheuk-Ki-CV-zh-Hant.pdf" },
    "zh-Hans": { file: "cv-zh-Hans.pdf", name: "Lee-Cheuk-Ki-CV-zh-Hans.pdf" }
  };

  var html = document.documentElement;
  var sidebar = document.getElementById("sidebar");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var langButtons = Array.prototype.slice.call(document.querySelectorAll(".lang__btn"));

  // Live weather for the greeting: null until a request succeeds.
  var weather = null;

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

  // ?lang=zh-Hant wins for this visit only, which also lets the PDF build
  // render each language from the same page.
  function readUrlLang() {
    try {
      var match = /[?&]lang=([^&]+)/.exec(window.location.search);
      if (match) {
        var code = decodeURIComponent(match[1]);
        if (isSupported(code)) return code;
      }
    } catch (e) { /* no query string: ignore */ }
    return null;
  }

  // English first, as specified. A previously chosen language is honoured,
  // but the browser's own language is deliberately NOT used to pick a default.
  function detectInitialLanguage() {
    var saved = readStored(STORAGE_KEY);
    if (isSupported(saved)) return saved;
    return DICT.defaultLang;
  }

  function currentLang() {
    return html.getAttribute("data-lang") || DICT.defaultLang;
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

    // The PDF link and the greeting both depend on the chosen language.
    var link = document.querySelector(".pdf-link");
    if (link) {
      var pdf = PDFS[code] || PDFS[DICT.defaultLang];
      link.setAttribute("href", pdf.file);
      link.setAttribute("download", pdf.name);
    }
    paintGreeting(code);

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
    applyLanguage(readUrlLang() || detectInitialLanguage(), { persist: false });
  }

  /* ------------------------------------------------------------------ *
   * Text size — A–  |  100%  |  A+
   * ------------------------------------------------------------------ */
  function clampScale(value) {
    value = Math.round(value * 10) / 10;
    if (value < TEXT_MIN) value = TEXT_MIN;
    if (value > TEXT_MAX) value = TEXT_MAX;
    return value;
  }

  function readTextScale() {
    var raw = parseFloat(readStored(TEXT_KEY));
    if (!isFinite(raw)) return 1;
    return clampScale(raw);
  }

  function applyTextScale(scale, options) {
    var persist = !options || options.persist !== false;
    html.style.setProperty("--fs", String(scale));

    var readout = document.getElementById("textsize-value");
    if (readout) readout.textContent = Math.round(scale * 100) + "%";

    var down = document.querySelector('[data-textsize="down"]');
    var up = document.querySelector('[data-textsize="up"]');
    // Floating point: compare with a small tolerance.
    if (down) down.disabled = scale <= TEXT_MIN + 1e-9;
    if (up) up.disabled = scale >= TEXT_MAX - 1e-9;

    if (persist) writeStored(TEXT_KEY, String(scale));
  }

  function initTextSize() {
    var scale = readTextScale();
    var buttons = document.querySelectorAll("[data-textsize]");

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var action = this.getAttribute("data-textsize");
        if (action === "down") scale = clampScale(scale - TEXT_STEP);
        else if (action === "up") scale = clampScale(scale + TEXT_STEP);
        else scale = 1; // reset
        applyTextScale(scale);
      });
    }

    applyTextScale(scale, { persist: false });
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
   * Reading progress bar + back-to-top button
   * ------------------------------------------------------------------ */
  function initChrome() {
    var bar = document.getElementById("progress-bar");
    var top = document.getElementById("to-top");
    if (!bar && !top) return;

    var ticking = false;
    var SHOW_AFTER = 320;

    function update() {
      ticking = false;
      var doc = document.documentElement;
      var y = window.pageYOffset || doc.scrollTop || 0;
      var max = doc.scrollHeight - window.innerHeight;

      if (bar) {
        var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        bar.style.transform = "scaleX(" + ratio + ")";
      }
      if (top) top.classList.toggle("is-visible", y > SHOW_AFTER);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    if (top) {
      top.addEventListener("click", function () {
        var still = false;
        try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* ignore */ }
        if (window.scrollTo) window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
        else window.scrollTo(0, 0);

        // Move the reading position, not just the scroll position.
        var main = document.getElementById("main");
        if (main && main.focus) {
          try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); }
        }
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Greeting — time of day, plus the weather when it can be fetched
   * ------------------------------------------------------------------ */
  function greetingKey(date) {
    var hour = date.getHours();
    if (hour >= 3 && hour < 12) return GREETING_KEYS.morning;
    if (hour >= 12 && hour < 18) return GREETING_KEYS.afternoon;
    return GREETING_KEYS.evening;
  }

  function replaceAll(text, token, value) {
    return text.split(token).join(value);
  }

  // The weather arrives from a third party, so it is only ever written as
  // text, never as markup, and the numbers are validated first.
  function paintGreeting(lang) {
    var element = document.getElementById("greeting-text");
    if (!element) return;

    var hello = translate(lang, greetingKey(new Date()));
    if (!weather) { element.textContent = hello; return; }

    var condition = translate(lang, WEATHER_KEYS[weather.code] || WEATHER_KEYS[3]);
    var place = weather.placeKey
      ? translate(lang, weather.placeKey)
      : (weather.place || translate(lang, "greet.place"));
    var template = translate(lang, "greet.weatherTpl") || "{temp}°C";

    template = replaceAll(template, "{temp}", String(weather.temp));
    template = replaceAll(template, "{cond}", condition);
    template = replaceAll(template, "{place}", place);

    element.textContent = hello + " · " + template;
  }

  // The place label comes from the API's IANA timezone, e.g. "Asia/Hong_Kong".
  // Only the last segment is used, and it is reduced to letters, digits and a
  // few punctuation marks — it is shown as text, never as markup.
  function tidyPlace(value) {
    if (typeof value !== "string") return null;
    var parts = value.split("/");
    var last = parts[parts.length - 1].replace(/_/g, " ").trim();
    last = last.replace(/[^A-Za-z0-9\u00C0-\u024F\u4E00-\u9FFF\u3040-\u30FF .'-]/g, "");
    last = last.trim().slice(0, 40);
    return last || null;
  }

  function requestWeather(lat, lon, placeKey, done) {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
              "&longitude=" + lon + "&current=temperature_2m,weather_code&timezone=auto";

    var controller = null;
    try { controller = new AbortController(); } catch (e) { /* older browser */ }

    var timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 8000);

    window.fetch(url, {
      signal: controller ? controller.signal : undefined,
      credentials: "omit",
      mode: "cors"
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        window.clearTimeout(timer);
        var current = data && data.current;
        var temp = current && current.temperature_2m;
        if (typeof temp !== "number" || !isFinite(temp)) { done(null); return; }
        done({
          temp: Math.round(temp),
          code: current.weather_code,
          place: tidyPlace(data.timezone),
          placeKey: placeKey
        });
      })
      .catch(function () {
        window.clearTimeout(timer);
        done(null);
      });
  }

  function loadWeather(lat, lon, placeKey) {
    requestWeather(lat, lon, placeKey, function (result) {
      // Keep the plain greeting if the request failed or was offline.
      if (!result) return;
      weather = result;
      paintGreeting(currentLang());
    });
  }

  function initGreeting() {
    var button = document.getElementById("geo-btn");

    // Hong Kong by default; no request for the visitor's position until
    // they either allow it or ask for it.
    loadWeather(HOME.lat, HOME.lon, "greet.place");

    if (!button || !navigator.geolocation || !window.fetch) return;

    function useDeviceLocation() {
      button.hidden = true;
      navigator.geolocation.getCurrentPosition(
        function (position) {
          loadWeather(position.coords.latitude, position.coords.longitude, null);
        },
        function () { /* denied or unavailable: Hong Kong stays */ },
        { timeout: 8000, maximumAge: 600000 }
      );
    }

    button.addEventListener("click", useDeviceLocation);

    // Only prompt automatically if permission was already granted;
    // otherwise offer the button instead of a surprise dialog.
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (status) {
          if (status.state === "granted") useDeviceLocation();
          else if (status.state === "prompt") button.hidden = false;
        })
        .catch(function () { button.hidden = false; });
    } else {
      button.hidden = false;
    }

    // Keep the greeting correct if the page is left open.
    window.setInterval(function () { paintGreeting(currentLang()); }, 60000);
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

  /* ------------------------------------------------------------------ */
  function init() {
    initLanguage();
    initTheme();
    initTextSize();
    initNav();
    initScrollSpy();
    initChrome();
    initGreeting();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
