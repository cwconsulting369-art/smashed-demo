/* SMASHED — Interaktion: Burger-Menü, Live-Öffnungsstatus, Filter. */
(function () {
  "use strict";

  /* Öffnungszeiten (Quelle: bestsmashburger.de, 17.07.2026): täglich 12:00 - 22:00. */
  var OPEN = 12 * 60, CLOSE = 22 * 60;

  function berlinNow() {
    var f = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false
    });
    var parts = {};
    f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var hour = parseInt(parts.hour, 10);
    if (hour === 24) hour = 0;
    return hour * 60 + parseInt(parts.minute, 10);
  }

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }

  function updateStatus() {
    var el = document.getElementById("status");
    var txt = document.getElementById("status-txt");
    if (!el || !txt) return;
    var now = berlinNow();
    el.classList.remove("is-closed");
    if (now >= OPEN && now < CLOSE) {
      txt.textContent = "Jetzt geöffnet — bis " + fmt(CLOSE) + " Uhr";
    } else {
      el.classList.add("is-closed");
      txt.textContent = now < OPEN ? "Öffnet heute um " + fmt(OPEN) + " Uhr" : "Öffnet morgen um " + fmt(OPEN) + " Uhr";
    }
  }

  function applyFilter(filter) {
    document.querySelectorAll(".card").forEach(function (c) {
      var cat = c.getAttribute("data-cat");
      c.style.display = (filter === "all" || cat === filter) ? "" : "none";
    });
  }

  function init() {
    updateStatus();
    setInterval(updateStatus, 60000);

    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    var hdr = document.getElementById("hdr");
    var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var burger = document.getElementById("burger");
    var navEl = document.getElementById("nav");
    if (burger && navEl) {
      var setMenu = function (open) {
        navEl.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
      };
      burger.addEventListener("click", function () { setMenu(!navEl.classList.contains("is-open")); });
      navEl.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
      document.addEventListener("click", function (e) {
        if (navEl.classList.contains("is-open") && !navEl.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
          setMenu(false);
        }
      });
    }

    document.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
        applyFilter(c.getAttribute("data-filter"));
      });
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      document.querySelectorAll(".rise").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll(".rise").forEach(function (el) { el.classList.add("in"); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
