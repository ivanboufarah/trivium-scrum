/* Recursos y aprendizaje: glosario (US-12), FAQ (US-13), enlaces (US-14) y ejercicios (US-15) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var norm = function (s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); };

  /* ---------- Glosario: búsqueda en tiempo real + índice A-Z ---------- */
  var search = $("#glSearch"), az = $("#glAz"), terms = $$(".gl-term"), groups = $$(".gl-group");
  if (search && az) {
    var letter = "", empty = $("#glEmpty"), count = $("#glCount");
    var firstLetter = function (t) { return norm(t.getAttribute("data-term")).charAt(0).toUpperCase(); };
    var avail = {};
    terms.forEach(function (t) { avail[firstLetter(t)] = true; });
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = L; b.disabled = !avail[L];
      b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Términos con la letra " + L);
      b.addEventListener("click", function () { letter = letter === L ? "" : L; apply(); });
      az.appendChild(b);
    });
    var apply = function () {
      var q = norm(search.value.trim()), shown = 0;
      terms.forEach(function (t) {
        var ok = (!q || norm(t.textContent).indexOf(q) >= 0) && (!letter || firstLetter(t) === letter);
        t.hidden = !ok; if (ok) shown++;
      });
      groups.forEach(function (g) { g.hidden = !$$(".gl-term:not([hidden])", g).length; });
      $$("button", az).forEach(function (b) { b.setAttribute("aria-pressed", String(b.textContent === letter)); });
      empty.hidden = shown !== 0;
      count.textContent = shown === 0 ? "" : shown + (shown === 1 ? " término" : " términos") + (q || letter ? " encontrados" : " en total");
    };
    search.addEventListener("input", apply);
    apply();
  }

  /* ---------- FAQ con altura animada ---------- */
  $$(".faq__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      document.getElementById(b.getAttribute("aria-controls")).classList.toggle("is-open", open);
    });
  });

  /* ---------- Enlaces externos: siempre en pestaña nueva y de forma segura ---------- */
  $$("a[href^='http']").forEach(function (a) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  /* ---------- Ejercicios: mostrar / ocultar solución ---------- */
  $$("[data-sol]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = document.getElementById(b.getAttribute("data-sol"));
      var open = p.hidden;
      p.hidden = !open;
      b.setAttribute("aria-expanded", String(open));
      b.textContent = open ? "Ocultar solución" : "Mostrar solución";
    });
  });
})();
