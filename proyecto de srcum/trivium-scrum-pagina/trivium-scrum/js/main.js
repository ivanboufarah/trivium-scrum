/* ==========================================================
   Trivium Scrum - Comportamiento compartido del sitio
   Módulos:  1) Menú hamburguesa (portada)      2) Acordeones
             3) Detalle ISO (Fundamentos)        4) Filtro de herramientas
             5) Línea de tiempo SDLC             6) Navegación interna y anclajes
             7) Tabla de contenidos flotante     8) Lightbox de diagramas
   ========================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var smooth = reduceMotion ? "auto" : "smooth";

  /* ---------- 1) Menú hamburguesa (portada) ---------- */
  var toggle = $(".menu-toggle");
  var menu = $("#menu-principal");
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    };
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$(".main-nav .pill").forEach(function (l) { l.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });
    var current = window.location.pathname.split("/").pop() || "index.html";
    $$(".main-nav .pill").forEach(function (l) {
      if (l.getAttribute("href").split("#")[0] === current) { l.classList.add("is-active"); l.setAttribute("aria-current", "page"); }
    });
  }

  /* ---------- 2) Acordeones (filas blancas desplegables) ---------- */
  function setAcc(btn, open) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".acc__btn[aria-controls]");
    if (btn) setAcc(btn, btn.getAttribute("aria-expanded") !== "true");
  });

  /* ---------- 3) Detalle de estándares ISO (Fundamentos) ---------- */
  var isoBtns = $$(".iso[aria-controls]");
  function closeIso(returnFocus) {
    isoBtns.forEach(function (b) {
      if (b.getAttribute("aria-expanded") === "true" && returnFocus) b.focus();
      b.setAttribute("aria-expanded", "false");
      var p = document.getElementById(b.getAttribute("aria-controls"));
      if (p) p.hidden = true;
    });
  }
  isoBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var wasOpen = b.getAttribute("aria-expanded") === "true";
      closeIso(false);
      if (!wasOpen) {
        b.setAttribute("aria-expanded", "true");
        var p = document.getElementById(b.getAttribute("aria-controls"));
        p.hidden = false;
        if (window.innerWidth <= 1000) p.scrollIntoView({ behavior: smooth, block: "nearest" });
      }
    });
  });
  $$(".popover__close").forEach(function (c) { c.addEventListener("click", function () { closeIso(true); }); });
  if (isoBtns.length) {
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeIso(true); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".popover") && !e.target.closest(".iso")) closeIso(false);
    });
  }

  /* ---------- 4) Filtro de herramientas por categoría ---------- */
  var cats = $$(".cat[data-cat]");
  if (cats.length) {
    var tools = $$(".tool[data-cat]");
    var details = $$(".detail[data-detail]");
    var status = $(".filter-status");
    var reset = $("[data-reset]");
    var apply = function (cat) {
      var shown = 0;
      cats.forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-cat") === cat)); });
      tools.forEach(function (t) {
        var show = !cat || t.getAttribute("data-cat") === cat;
        t.hidden = !show;
        if (show) shown++;
      });
      details.forEach(function (d) { d.hidden = d.getAttribute("data-detail") !== cat; });
      if (reset) reset.hidden = !cat;
      if (status) {
        var name = cat ? cats.filter(function (c) { return c.getAttribute("data-cat") === cat; })[0].getAttribute("data-name") : "";
        status.textContent = cat
          ? "Mostrando " + shown + " herramienta" + (shown === 1 ? "" : "s") + " de " + name
          : "Mostrando las " + shown + " herramientas";
      }
    };
    cats.forEach(function (c) {
      c.addEventListener("click", function () {
        var cat = c.getAttribute("data-cat");
        apply(c.getAttribute("aria-pressed") === "true" ? "" : cat);
        if (c.getAttribute("aria-pressed") === "true") {
          var d = $(".detail[data-detail='" + cat + "']");
          if (d) d.scrollIntoView({ behavior: smooth, block: "nearest" });
        }
      });
    });
    if (reset) reset.addEventListener("click", function () { apply(""); });
    apply("");
  }

  /* ---------- 5) Línea de tiempo SDLC ---------- */
  var items = $$(".tl__item");
  var list = $(".tl__list");
  if (items.length && list) {
    var selected = -1;
    var prev = $("[data-tl-prev]"), next = $("[data-tl-next]");
    var nodeY = function (i) {
      var n = $(".tl__node", items[i]).getBoundingClientRect();
      return n.top + n.height / 2;
    };
    var paintScroll = function () {
      var line = window.innerHeight * 0.62, lit = -1;
      items.forEach(function (it, i) { if (nodeY(i) <= line) lit = i; });
      items.forEach(function (it, i) { it.classList.toggle("is-lit", i <= lit); });
      var y = lit >= 0 ? nodeY(lit) - list.getBoundingClientRect().top : 0;
      list.style.setProperty("--progress", Math.max(0, y) + "px");
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; paintScroll(); }); }
    }, { passive: true });
    window.addEventListener("resize", paintScroll);

    var select = function (i, scroll) {
      i = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (it, k) {
        var on = k === i;
        var chip = $(".tl__chip", it), card = $(".tl__card", it);
        it.classList.toggle("is-open", on);
        it.classList.toggle("is-current", on);
        chip.setAttribute("aria-expanded", String(on));
        card.hidden = !on;
      });
      selected = i;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === items.length - 1;
      if (scroll !== false) {
        requestAnimationFrame(function () {
          var r = items[i].getBoundingClientRect();
          var target = window.scrollY + r.top - window.innerHeight * 0.3;
          window.scrollTo({ top: target, behavior: smooth });
        });
      }
      setTimeout(paintScroll, reduceMotion ? 0 : 450);
    };
    items.forEach(function (it, i) {
      var chip = $(".tl__chip", it);
      chip.addEventListener("click", function () {
        if (selected === i) { it.classList.remove("is-open", "is-current"); chip.setAttribute("aria-expanded", "false"); $(".tl__card", it).hidden = true; selected = -1; if (prev) prev.disabled = true; if (next) next.disabled = false; }
        else select(i);
      });
      $(".tl__node", it).addEventListener("click", function () { select(i); });
    });
    if (prev) prev.addEventListener("click", function () { select(selected < 0 ? 0 : selected - 1); });
    if (next) next.addEventListener("click", function () { select(selected + 1); });
    if (prev) prev.disabled = true;
    paintScroll();
  }

  /* ---------- 6) Navegación interna y anclajes ---------- */
  function flash(el) {
    el.classList.add("is-target");
    setTimeout(function () { el.classList.remove("is-target"); }, 1600);
  }
  function openTarget(id, behavior) {
    var el = document.getElementById(id);
    if (!el) return false;
    var btn = el.matches(".acc__btn") ? el : null;
    if (btn) setAcc(btn, true);
    var model = el.closest(".model") || (el.classList.contains("model") ? el : null);
    if (el.classList.contains("model")) {
      var first = $(".acc__btn", el);
      if (first && !$(".acc__btn[aria-expanded='true']", el)) setAcc(first, true);
      flash(el);
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
    el.scrollIntoView({ behavior: behavior || smooth, block: "start" });
    return !!model || true;
  }
  $$("[data-go]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      openTarget(id);
      if (window.history && history.replaceState) history.replaceState(null, "", "#" + id);
      $$("[data-go]", a.closest("nav,.toc") || document).forEach(function (x) { x.classList.toggle("is-current", x === a); });
      var panel = a.closest(".toc");
      if (panel && window.innerWidth <= 760) { panel.hidden = true; var f = $(".toc-fab"); if (f) f.setAttribute("aria-expanded", "false"); }
    });
  });
  // Resaltado según el scroll
  var spy = $$("[data-go]");
  if (spy.length) {
    var targets = [];
    spy.forEach(function (a) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (t && targets.indexOf(t) < 0) targets.push(t);
    });
    var paintSpy = function () {
      var cur = null, curTop = -1e9;
      targets.forEach(function (t) {
        var top = t.getBoundingClientRect().top;
        if (top <= 130 && top >= curTop) { cur = t; curTop = top; }
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = targets[targets.length - 1];
      // Si varios destinos están a la misma altura (tarjetas en columnas), se conserva la selección del clic
      var sameRow = cur && targets.some(function (t) { return t !== cur && Math.abs(t.getBoundingClientRect().top - cur.getBoundingClientRect().top) < 8; });
      if (!cur || sameRow) return;
      spy.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + cur.id;
        a.classList.toggle("is-current", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    var spyTick = false;
    window.addEventListener("scroll", function () {
      if (!spyTick) { spyTick = true; requestAnimationFrame(function () { spyTick = false; paintSpy(); }); }
    }, { passive: true });
  }
  // Enlaces profundos (ej. modelos-tradicionales.html#modelo-v)
  function fromHash() {
    var id = decodeURIComponent((window.location.hash || "").slice(1));
    if (id && document.getElementById(id)) setTimeout(function () { openTarget(id, "auto"); }, 60);
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);

  /* ---------- 7) Tabla de contenidos flotante ---------- */
  var fab = $(".toc-fab"), toc = $(".toc");
  if (fab && toc) {
    var setToc = function (open) { toc.hidden = !open; fab.setAttribute("aria-expanded", String(open)); };
    fab.addEventListener("click", function () { setToc(toc.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !toc.hidden) { setToc(false); fab.focus(); } });
    document.addEventListener("click", function (e) { if (!toc.hidden && !toc.contains(e.target) && !fab.contains(e.target)) setToc(false); });
  }

  /* ---------- 8) Lightbox de diagramas ---------- */
  var zooms = $$(".zoom");
  if (zooms.length && typeof HTMLDialogElement === "function") {
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Imagen ampliada");
    dlg.innerHTML = '<button class="lightbox__close" type="button">Cerrar ✕</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    var big = $("img", dlg), cap = $("p", dlg), opener = null;
    zooms.forEach(function (z) {
      z.addEventListener("click", function () {
        opener = z;
        big.src = z.getAttribute("data-full");
        big.alt = z.getAttribute("data-alt") || "";
        cap.textContent = z.getAttribute("data-caption") || "";
        dlg.showModal();
      });
    });
    $(".lightbox__close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  }
})();
