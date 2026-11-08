/* Metodologías en detalle: Scrum (US-10) y Kanban con WIP (US-11) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Pestañas accesibles ---------- */
  var tabs = $$(".tab");
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { selectTab(n); n.focus(); e.preventDefault(); }
    });
  });

  /* ---------- Cronograma interactivo del Sprint ---------- */
  var weeksEl = $("#weeks");
  if (weeksEl) {
    var hrs = function (h) {
      if (h < 1) return Math.round(h * 60) + " min";
      var whole = Math.floor(h), min = Math.round((h - whole) * 60);
      return whole + " h" + (min ? " " + min + " min" : "");
    };
    var EVENTS = {
      sprint: { name: "Sprint", icon: "🏃", when: "Todo el período del Sprint",
        dur: function (w) { return w + (w === 1 ? " semana" : " semanas") + " (duración fija)"; },
        goal: "Es el contenedor de todos los demás eventos. Es el período en el que se trabaja para alcanzar el Objetivo del Sprint y producir un incremento.",
        who: "Todo el Scrum Team", out: "Un incremento utilizable del producto" },
      planning: { name: "Sprint Planning", icon: "🗓️", when: "Primer día del Sprint",
        dur: function (w) { return "Hasta " + hrs(2 * w); },
        goal: "Definir por qué el Sprint es valioso, qué trabajo se puede realizar y cómo se llevará adelante.",
        who: "Product Owner, Scrum Master y Developers", out: "Objetivo del Sprint y Sprint Backlog" },
      daily: { name: "Daily Scrum", icon: "☀️", when: "Todos los días del Sprint",
        dur: function () { return "15 minutos"; },
        goal: "Inspeccionar el progreso hacia el Objetivo del Sprint y adaptar el plan de trabajo.",
        who: "Developers (el Scrum Master y el Product Owner pueden asistir)", out: "Plan actualizado para las próximas 24 horas" },
      review: { name: "Sprint Review", icon: "👀", when: "Último día del Sprint",
        dur: function (w) { return "Hasta " + hrs(w); },
        goal: "Inspeccionar el resultado del Sprint con las partes interesadas y acordar los próximos pasos.",
        who: "Scrum Team y partes interesadas", out: "Product Backlog ajustado" },
      retro: { name: "Sprint Retrospective", icon: "🔁", when: "Último día, después de la Review",
        dur: function (w) { return "Hasta " + hrs(0.75 * w); },
        goal: "Analizar cómo trabajó el equipo (personas, procesos y herramientas) y definir mejoras para el siguiente Sprint.",
        who: "Scrum Team", out: "Mejoras concretas para el próximo Sprint" }
    };
    var weeks = 2, current = "daily";
    var lenSeg = $("#lenSeg"), eventsEl = $("#events"), detail = $("#evDetail");

    [1, 2, 3, 4].forEach(function (n) {
      var b = document.createElement("button");
      b.type = "button"; b.dataset.w = n; b.textContent = n + (n === 1 ? " semana" : " semanas");
      b.addEventListener("click", function () { weeks = n; renderSprint(); });
      lenSeg.appendChild(b);
    });
    Object.keys(EVENTS).forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ev"; b.dataset.k = k;
      b.textContent = EVENTS[k].icon + " " + EVENTS[k].name;
      b.addEventListener("click", function () { current = k; renderSprint(); });
      eventsEl.appendChild(b);
    });

    var renderSprint = function () {
      $$("button", lenSeg).forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.w === weeks)); });
      $$("button", eventsEl).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.k === current)); });
      var total = weeks * 5;
      weeksEl.innerHTML = "";
      for (var w = 0; w < weeks; w++) {
        var row = document.createElement("div"); row.className = "week";
        row.innerHTML = '<div class="week-label">Sem. ' + (w + 1) + "</div>";
        for (var d = 0; d < 5; d++) {
          var idx = w * 5 + d + 1, first = idx === 1, last = idx === total;
          var cell = document.createElement("div"); cell.className = "day";
          var tags = "";
          if (first) tags += '<span class="tag">Planning</span>';
          tags += '<span class="tag d">Daily</span>';
          if (last) tags += '<span class="tag">Review</span><span class="tag">Retro</span>';
          cell.innerHTML = '<span class="n">Día ' + idx + "</span>" + tags;
          var on = current === "sprint" || current === "daily" ||
                   (current === "planning" && first) ||
                   ((current === "review" || current === "retro") && last);
          if (on) cell.classList.add("hl");
          row.appendChild(cell);
        }
        weeksEl.appendChild(row);
      }
      var e = EVENTS[current];
      detail.innerHTML = "<h4>" + e.icon + " " + e.name + "</h4><dl>" +
        "<dt>Cuándo</dt><dd>" + e.when + "</dd>" +
        "<dt>Duración sugerida</dt><dd>" + e.dur(weeks) + " <small>(Sprint de " + weeks + (weeks === 1 ? " semana" : " semanas") + ")</small></dd>" +
        "<dt>Objetivo</dt><dd>" + e.goal + "</dd>" +
        "<dt>Participan</dt><dd>" + e.who + "</dd>" +
        "<dt>Resultado</dt><dd>" + e.out + "</dd></dl>";
    };
    renderSprint();
  }

  /* ---------- Tablero Kanban con límite WIP ---------- */
  var board = $("#board");
  if (board) {
    var COLS = ["todo", "doing", "done"];
    var NAMES = { todo: "Por hacer", doing: "En proceso", done: "Hecho" };
    var KEY = "trivium_kanban_v1";
    var DEFAULT = function () {
      return { wip: 3, next: 7, cards: [
        { id: 1, col: "todo", title: "Diseñar pantalla de login", tip: "Una tarjeta = una unidad de trabajo visible." },
        { id: 2, col: "todo", title: "Escribir casos de prueba", tip: "Si algo se bloquea, queda a la vista de todos." },
        { id: 3, col: "todo", title: "Configurar el repositorio", tip: "Lo más prioritario va arriba de la columna." },
        { id: 4, col: "todo", title: "Revisar el glosario", tip: "Se toma solo cuando hay capacidad libre." },
        { id: 5, col: "doing", title: "Maquetar la página de inicio", tip: "Trabajo en curso: cuenta para el límite WIP." },
        { id: 6, col: "done", title: "Definir la paleta de colores", tip: "Hecho = cumple el criterio acordado." }
      ] };
    };
    var state;
    try { var s = JSON.parse(localStorage.getItem(KEY)); state = (s && s.cards && s.wip) ? s : DEFAULT(); } catch (e) { state = DEFAULT(); }
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
    var toast = $("#toast"), wipSel = $("#wipSel"), dragId = null;
    var say = function (m, t) { toast.textContent = m; toast.className = "toast" + (t ? " " + t : ""); };
    var countIn = function (c) { return state.cards.filter(function (x) { return x.col === c; }).length; };

    var move = function (id, to) {
      var c = state.cards.filter(function (x) { return x.id === id; })[0];
      if (!c || c.col === to) return false;
      if (to === "doing" && countIn("doing") >= state.wip) {
        var col = $("#col-doing");
        col.classList.remove("denied"); void col.offsetWidth; col.classList.add("denied");
        say("⛔ Límite WIP alcanzado (" + state.wip + "/" + state.wip + "). Para empezar «" + c.title + "», primero terminá o devolvé otra tarea de «En proceso».", "err");
        return false;
      }
      c.col = to; save(); render();
      if (to === "done") say("✅ «" + c.title + "» terminada. Se liberó capacidad en el flujo.", "ok");
      else if (to === "doing") say("▶️ «" + c.title + "» en proceso (" + countIn("doing") + "/" + state.wip + ").", "ok");
      else say("↩️ «" + c.title + "» vuelve a «" + NAMES[to] + "».");
      return true;
    };

    var render = function () {
      COLS.forEach(function (col) {
        var list = $('[data-list="' + col + '"]');
        list.innerHTML = "";
        state.cards.filter(function (c) { return c.col === col; }).forEach(function (c) {
          var el = document.createElement("div");
          el.className = "kcard"; el.draggable = true;
          var h = document.createElement("h4"); h.textContent = c.title;
          var p = document.createElement("p"); p.textContent = c.tip || "";
          var acts = document.createElement("div"); acts.className = "acts";
          var i = COLS.indexOf(col);
          var bL = document.createElement("button"); bL.type = "button"; bL.textContent = "◀"; bL.disabled = i === 0;
          bL.setAttribute("aria-label", "Mover «" + c.title + "» a " + (i > 0 ? NAMES[COLS[i - 1]] : ""));
          bL.addEventListener("click", function () { move(c.id, COLS[i - 1]); });
          var bR = document.createElement("button"); bR.type = "button"; bR.textContent = "▶"; bR.disabled = i === COLS.length - 1;
          bR.setAttribute("aria-label", "Mover «" + c.title + "» a " + (i < COLS.length - 1 ? NAMES[COLS[i + 1]] : ""));
          bR.addEventListener("click", function () { move(c.id, COLS[i + 1]); });
          acts.appendChild(bL); acts.appendChild(bR);
          el.appendChild(h); el.appendChild(p); el.appendChild(acts);
          el.addEventListener("dragstart", function (e) { dragId = c.id; el.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(c.id)); });
          el.addEventListener("dragend", function () { dragId = null; el.classList.remove("dragging"); $$(".col").forEach(function (x) { x.classList.remove("over"); }); });
          list.appendChild(el);
        });
        var cnt = $('[data-count="' + col + '"]');
        if (col === "doing") { cnt.textContent = countIn("doing") + " / " + state.wip; cnt.classList.toggle("full", countIn("doing") >= state.wip); }
        else cnt.textContent = countIn(col);
      });
      wipSel.value = String(state.wip);
    };

    $$(".col").forEach(function (col) {
      col.addEventListener("dragover", function (e) { e.preventDefault(); col.classList.add("over"); });
      col.addEventListener("dragleave", function (e) { if (!col.contains(e.relatedTarget)) col.classList.remove("over"); });
      col.addEventListener("drop", function (e) {
        e.preventDefault(); col.classList.remove("over");
        var id = dragId !== null ? dragId : +e.dataTransfer.getData("text/plain");
        move(id, col.dataset.col);
      });
    });
    wipSel.addEventListener("change", function () {
      var v = +wipSel.value;
      if (v < countIn("doing")) {
        say("No se puede fijar el límite en " + v + ": ya hay " + countIn("doing") + " tareas en proceso. Terminá alguna primero.", "err");
        wipSel.value = String(state.wip); return;
      }
      state.wip = v; save(); render(); say("Límite WIP actualizado a " + v + ".");
    });
    var add = function () {
      var input = $("#newCard"), title = input.value.trim();
      if (!title) { say("Escribí un título para la tarea.", "err"); input.focus(); return; }
      state.cards.push({ id: state.next++, col: "todo", title: title, tip: "Tarea creada por vos." });
      input.value = ""; save(); render(); say("➕ «" + title + "» agregada a «Por hacer».", "ok");
    };
    $("#addBtn").addEventListener("click", add);
    $("#newCard").addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
    $("#resetBtn").addEventListener("click", function () { state = DEFAULT(); save(); render(); say("Tablero reiniciado."); });
    render();
  }
})();
