/* Comparador de metodologías (US-18): tabla dinámica según las seleccionadas */
(function () {
  "use strict";
  var M = [
    { id: "cascada", name: "Cascada", tipo: "Tradicional" },
    { id: "modelov", name: "Modelo en V", tipo: "Tradicional" },
    { id: "iterativo", name: "Iterativo e incremental", tipo: "Tradicional" },
    { id: "scrum", name: "Scrum", tipo: "Ágil" },
    { id: "kanban", name: "Kanban", tipo: "Ágil" },
    { id: "xp", name: "XP", tipo: "Ágil" }
  ];
  // Cada fila: [etiqueta, [valor por metodología en el orden de M]]. "lvl:" y "tipo:" marcan valores con color.
  var ROWS = [
    ["Tipo", ["tipo:Tradicional", "tipo:Tradicional", "tipo:Tradicional", "tipo:Ágil", "tipo:Ágil", "tipo:Ágil"]],
    ["Enfoque", ["Secuencial, por fases consecutivas.", "Secuencial, con una etapa de prueba asociada a cada etapa de desarrollo.", "Ciclos repetidos que agregan funcionalidad en cada incremento.", "Marco de trabajo con Sprints de 1 a 4 semanas.", "Flujo continuo visualizado en un tablero y con trabajo en proceso limitado.", "Prácticas de ingeniería aplicadas en iteraciones muy cortas."]],
    ["Roles", ["No prescribe roles; suele haber analistas, diseñadores, programadores y testers.", "No prescribe roles; igual que en cascada, con fuerte participación de testers.", "No prescribe roles específicos.", "Product Owner, Scrum Master y Developers.", "No prescribe roles; usa los que ya existen.", "Cliente, programadores, coach y tracker."]],
    ["Flexibilidad ante cambios", ["lvl:baja:Baja", "lvl:baja:Baja", "lvl:media:Media", "lvl:alta:Alta", "lvl:alta:Alta", "lvl:alta:Alta"]],
    ["Entregas", ["Una al final del proyecto.", "Una al final, con pruebas planificadas desde el inicio.", "Incrementos sucesivos.", "Un incremento al final de cada Sprint.", "Continuas, a medida que se completa cada tarea.", "Versiones pequeñas y frecuentes."]],
    ["Participación del cliente", ["lvl:baja:Baja (inicio y fin)", "lvl:baja:Baja (inicio y validación final)", "lvl:media:Media (en cada iteración)", "lvl:alta:Alta (Sprint Review)", "lvl:media:Media (según se necesite)", "lvl:alta:Muy alta (el cliente integra el equipo)"]],
    ["Documentación", ["lvl:alta:Extensa", "lvl:alta:Extensa", "lvl:media:Media", "lvl:baja:Mínima necesaria", "lvl:baja:Mínima", "lvl:baja:Mínima (la documentan el código y las pruebas)"]],
    ["Pruebas", ["Al final del desarrollo.", "En paralelo, un nivel de prueba por cada fase.", "Al final de cada iteración.", "Dentro de cada Sprint (Definición de Hecho).", "Durante todo el flujo de trabajo.", "Continuas: TDD y pruebas automatizadas."]],
    ["Ideal para", ["Requisitos estables y bien definidos.", "Sistemas críticos que exigen verificación y validación rigurosas.", "Proyectos grandes que pueden dividirse y evolucionar por partes.", "Productos con requisitos cambiantes y equipos pequeños o medianos.", "Soporte, mantenimiento y trabajo continuo.", "Equipos pequeños con requisitos muy cambiantes y foco técnico."]]
  ];

  var box = document.getElementById("cmpPick"), out = document.getElementById("cmpOut"), msg = document.getElementById("cmpMsg");
  if (!box || !out) return;
  var selected = ["scrum", "kanban"];

  M.forEach(function (m) {
    var l = document.createElement("label"); l.className = "chk";
    var i = document.createElement("input"); i.type = "checkbox"; i.value = m.id; i.checked = selected.indexOf(m.id) >= 0;
    i.addEventListener("change", function () {
      selected = Array.prototype.slice.call(box.querySelectorAll("input:checked")).map(function (x) { return x.value; });
      render();
    });
    var s = document.createElement("span"); s.textContent = m.name;
    var sm = document.createElement("small"); sm.textContent = m.tipo;
    l.appendChild(i); l.appendChild(s); l.appendChild(sm);
    box.appendChild(l);
  });

  function cell(v) {
    if (v.indexOf("lvl:") === 0) { var p = v.split(":"); return '<span class="pill-lvl lvl-' + p[1] + '">' + p[2] + "</span>"; }
    if (v.indexOf("tipo:") === 0) { var t = v.slice(5); return '<span class="pill-lvl ' + (t === "Ágil" ? "tipo-agil" : "tipo-trad") + '">' + t + "</span>"; }
    return v;
  }
  function render() {
    var idx = M.map(function (m, i) { return selected.indexOf(m.id) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
    if (idx.length < 2) {
      out.innerHTML = "";
      msg.hidden = false;
      msg.textContent = idx.length === 0 ? "Seleccioná al menos dos metodologías para compararlas." : "Seleccioná una metodología más para poder comparar.";
      return;
    }
    msg.hidden = true;
    out.innerHTML = '<div class="cmp-wrap"><table><caption>Comparación de ' + idx.map(function (i) { return M[i].name; }).join(", ") + '</caption><thead><tr><th scope="col">Característica</th>' +
      idx.map(function (i) { return '<th scope="col">' + M[i].name + "</th>"; }).join("") + "</tr></thead><tbody>" +
      ROWS.map(function (r) { return '<tr><th scope="row">' + r[0] + "</th>" + idx.map(function (i) { return "<td>" + cell(r[1][i]) + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }
  render();
})();
