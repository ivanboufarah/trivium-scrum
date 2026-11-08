/* Encuesta de Preferencias Metodológicas (US-19)
   Probar el algoritmo desde la consola: SGCS_SURVEY.runTests() */
var SGCS_SURVEY = (function () {
  "use strict";
  var METHODS = ["Scrum", "Kanban", "Cascada"];
  var TYPE = { Scrum: "ágil", Kanban: "ágil", Cascada: "tradicional" };
  // Pesos por opción: [Scrum, Kanban, Cascada], de 0 (no encaja) a 3 (encaja muy bien)
  var Q = [
    { t: "¿Qué tan claros y estables son los requisitos?", h: "Pensá en cuánto pueden cambiar desde el inicio hasta el final.", o: [
      ["Muy claros y casi no cambiarán", "Están definidos por escrito desde el comienzo.", [0, 1, 3]],
      ["Se conocen en parte y es probable que evolucionen", "Hay una visión general, pero faltan detalles.", [3, 2, 1]],
      ["Son inciertos o cambian con frecuencia", "Aparecen necesidades nuevas todo el tiempo.", [3, 2, 0]]] },
    { t: "¿Cuántas personas forman el equipo?", h: "Contá a quienes trabajan directamente en el proyecto.", o: [
      ["1 a 3 personas", "", [2, 3, 2]], ["4 a 9 personas", "", [3, 2, 2]], ["10 o más personas", "", [2, 2, 3]]] },
    { t: "¿Qué nivel de participación tendrá el cliente?", h: "", o: [
      ["Solo al inicio y al final", "Aprueba requisitos y recibe el producto terminado.", [0, 1, 3]],
      ["Da feedback periódico", "Revisa avances cada cierto tiempo.", [3, 2, 1]],
      ["Participa de forma constante", "Está disponible para decidir y priorizar día a día.", [2, 3, 0]]] },
    { t: "¿Cómo se esperan las entregas?", h: "", o: [
      ["Una única entrega final", "", [0, 0, 3]],
      ["Entregas parciales cada 2 a 4 semanas", "", [3, 1, 0]],
      ["Entrega continua, a medida que cada tarea se termina", "", [0, 3, 0]]] },
    { t: "¿Qué tipo de trabajo es?", h: "", o: [
      ["Un proyecto con inicio, fin y alcance definidos", "", [1, 0, 3]],
      ["Un producto que va a evolucionar con nuevas funciones", "", [3, 1, 1]],
      ["Soporte o mantenimiento con tareas impredecibles", "", [0, 3, 0]]] },
    { t: "¿Cuánta documentación formal se exige?", h: "Contratos, especificaciones detalladas, aprobaciones.", o: [
      ["Mucha: lo exige el cliente o una norma", "", [0, 1, 3]],
      ["Un nivel moderado", "", [2, 2, 2]],
      ["Lo mínimo necesario", "", [3, 3, 0]]] },
    { t: "¿Qué experiencia tiene el equipo con metodologías ágiles?", h: "", o: [
      ["Ninguna o muy poca", "", [1, 2, 3]], ["Alguna experiencia", "", [3, 2, 1]],
      ["Mucha, y se autoorganiza bien", "", [3, 3, 0]]] },
    { t: "¿Qué tan costoso sería cambiar algo ya construido?", h: "Por regulaciones, hardware o integración con otros sistemas.", o: [
      ["Muy costoso: cambiar al final sería grave", "", [0, 1, 3]],
      ["Costo medio", "", [2, 2, 2]],
      ["Bajo: se puede ajustar fácilmente", "", [3, 3, 0]]] }
  ];
  var INFO = {
    Scrum: "Scrum organiza el trabajo en Sprints cortos con roles y eventos definidos. Funciona bien cuando los requisitos evolucionan y se busca feedback frecuente.",
    Kanban: "Kanban visualiza el flujo de trabajo y limita el trabajo en proceso (WIP). Es ideal para trabajo continuo, soporte o equipos que priorizan la entrega constante.",
    Cascada: "Cascada avanza por fases secuenciales con documentación formal. Conviene cuando los requisitos son estables y cambiar tarde es muy costoso."
  };

  /* Algoritmo (función pura). answers[i] = índice de la opción elegida o null.
     puntaje = suma de pesos; máximo = 3 × preguntas; coincidencia % = puntaje / máximo × 100 */
  function compute(answers) {
    var raw = [0, 0, 0];
    answers.forEach(function (a, qi) {
      if (a === null || a === undefined || !Q[qi] || !Q[qi].o[a]) return;
      var w = Q[qi].o[a][2];
      for (var m = 0; m < 3; m++) raw[m] += w[m];
    });
    var max = Q.length * 3;
    var pct = raw.map(function (r) { return Math.round(r / max * 100); });
    var best = Math.max.apply(null, pct);
    var winners = METHODS.filter(function (_, i) { return pct[i] === best; });
    return { raw: raw, pct: pct, winners: winners, max: max };
  }

  var root = document.getElementById("wiz");
  var step = 0, answers = Q.map(function () { return null; });

  function renderQ() {
    var q = Q[step], total = Q.length, pct = Math.round(step / total * 100);
    var html = '<div class="wz-meta"><span>Pregunta ' + (step + 1) + " de " + total + "</span><span>" + pct + "% completado</span></div>" +
      '<div class="wz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progreso de la encuesta"><span style="width:' + pct + '%"></span></div>' +
      '<div class="wz-dots" aria-hidden="true">' + Q.map(function (_, i) { return '<i class="' + (i < step ? "done" : i === step ? "now" : "") + '"></i>'; }).join("") + "</div>" +
      '<fieldset class="wz-q"><legend>' + q.t + "</legend>" + (q.h ? '<p class="wz-help">' + q.h + "</p>" : "") + '<div class="wz-opts">' +
      q.o.map(function (o, i) {
        return '<label class="opt"><input type="radio" name="q' + step + '" value="' + i + '"' + (answers[step] === i ? " checked" : "") + "><span><b>" + o[0] + "</b>" + (o[1] ? "<small>" + o[1] + "</small>" : "") + "</span></label>";
      }).join("") + "</div></fieldset>" +
      '<div class="wz-nav"><button type="button" class="btn btn--ghost" id="bk"' + (step === 0 ? " disabled" : "") + '>← Anterior</button>' +
      '<button type="button" class="btn" id="nx"' + (answers[step] === null ? " disabled" : "") + ">" + (step === total - 1 ? "Ver resultado" : "Siguiente →") + "</button></div>";
    root.innerHTML = html;
    Array.prototype.forEach.call(root.querySelectorAll("input[type=radio]"), function (r) {
      r.addEventListener("change", function () { answers[step] = +r.value; root.querySelector("#nx").disabled = false; });
    });
    root.querySelector("#bk").addEventListener("click", function () { if (step > 0) { step--; renderQ(); } });
    root.querySelector("#nx").addEventListener("click", function () {
      if (answers[step] === null) return;
      if (step < total - 1) { step++; renderQ(); } else renderResult();
    });
  }

  function renderResult() {
    var r = compute(answers);
    var order = [0, 1, 2].sort(function (a, b) { return r.pct[b] - r.pct[a]; });
    var top = order[0], second = order[1];
    var tie = r.winners.length > 1, close = !tie && (r.pct[top] - r.pct[second] < 8);
    var reasons = answers.map(function (a, qi) { return { q: Q[qi].t, a: Q[qi].o[a][0], w: Q[qi].o[a][2][top] }; })
      .filter(function (x) { return x.w >= 3; }).slice(0, 3);
    var head = tie ? "Hay empate entre " + r.winners.join(" y ") : "Te conviene " + METHODS[top];
    var body = tie ? "Tu proyecto tiene características de varias metodologías. Considerá un enfoque híbrido. " + r.winners.map(function (w) { return INFO[w]; }).join(" ")
                   : INFO[METHODS[top]] + " (Enfoque " + TYPE[METHODS[top]] + ".)";
    root.innerHTML = '<div class="wz-result" tabindex="-1" id="wzres"><div class="kicker">Resultado</div><h3>' + head + "</h3><p>" + body + "</p>" +
      [0, 1, 2].map(function (i) {
        var win = r.winners.indexOf(METHODS[i]) >= 0;
        return '<div class="res-row' + (win ? " win" : "") + '"><div class="top"><span>' + METHODS[i] + (win ? '<span class="badge">Mejor coincidencia</span>' : "") + "</span><span>" + r.pct[i] + '%</span></div><div class="res-bar" role="img" aria-label="' + METHODS[i] + ": " + r.pct[i] + '% de coincidencia"><span data-w="' + r.pct[i] + '"></span></div></div>';
      }).join("") +
      (close ? '<div class="note">Las dos primeras opciones están muy cerca (' + METHODS[top] + " y " + METHODS[second] + "). Podés combinar ideas de ambas, por ejemplo con Scrumban.</div>" : "") +
      ((!tie && reasons.length) ? "<p><strong>Por qué " + METHODS[top] + ":</strong></p><ul class=\"why\">" + reasons.map(function (x) { return "<li>" + x.q + " → <em>" + x.a + "</em></li>"; }).join("") + "</ul>" : "") +
      '<p class="fine">El porcentaje indica cuánto coinciden tus respuestas con las condiciones ideales de cada metodología. No suman 100 %, porque un proyecto puede encajar bien en más de una.</p>' +
      '<div class="wz-nav"><button type="button" class="btn btn--ghost" id="rv">← Revisar respuestas</button><button type="button" class="btn" id="rs">Reiniciar encuesta</button></div></div>';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      Array.prototype.forEach.call(root.querySelectorAll(".res-bar span"), function (s) { s.style.width = s.dataset.w + "%"; });
    }); });
    root.querySelector("#rs").addEventListener("click", function () { answers = Q.map(function () { return null; }); step = 0; renderQ(); });
    root.querySelector("#rv").addEventListener("click", function () { step = Q.length - 1; renderQ(); });
    root.querySelector("#wzres").focus({ preventScroll: true });
  }

  function runTests() {
    var cases = [
      { name: "Todo «tradicional»", a: [0, 0, 0, 0, 0, 0, 0, 0], expect: "Cascada" },
      { name: "Requisitos cambiantes + entregas por Sprint", a: [1, 1, 1, 1, 1, 1, 1, 1], expect: "Scrum" },
      { name: "Soporte y entrega continua", a: [2, 0, 2, 2, 2, 2, 2, 2], expect: "Kanban" },
      { name: "Sin responder nada", a: [null, null, null, null, null, null, null, null], expect: null }
    ];
    var rows = cases.map(function (c) {
      var r = compute(c.a);
      var ok = c.expect === null ? r.pct.every(function (p) { return p === 0; }) : (r.winners.length === 1 && r.winners[0] === c.expect);
      return { caso: c.name, Scrum: r.pct[0] + "%", Kanban: r.pct[1] + "%", Cascada: r.pct[2] + "%", ganadora: r.winners.join("/"), ok: ok };
    });
    if (console.table) console.table(rows);
    return rows;
  }
  if (root) renderQ();
  return { compute: compute, runTests: runTests, QUESTIONS: Q, METHODS: METHODS };
})();
