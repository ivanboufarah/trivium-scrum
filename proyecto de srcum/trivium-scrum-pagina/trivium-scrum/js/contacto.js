/* Formulario de contacto (US-17): validación en el navegador.
   Este sitio es estático: no hay servidor que reciba el mensaje.
   Para enviarlo de verdad, conectar el submit con un servicio (Formspree, EmailJS, etc.). */
(function () {
  "use strict";
  var form = document.getElementById("contactForm");
  if (!form) return;
  var ok = document.getElementById("formOk");
  var f = { nombre: form.nombre, email: form.email, mensaje: form.mensaje };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    nombre: function (v) { return v.length < 2 ? "Ingresá tu nombre (mínimo 2 caracteres)." : ""; },
    email: function (v) { return !v ? "Ingresá tu correo electrónico." : (!EMAIL.test(v) ? "El correo no tiene un formato válido (ej: nombre@dominio.com)." : ""); },
    mensaje: function (v) { return v.length < 10 ? "Escribí un mensaje de al menos 10 caracteres." : ""; }
  };
  function check(k) {
    var input = f[k], wrap = input.closest(".fld"), err = wrap.querySelector(".err");
    var m = rules[k](input.value.trim());
    wrap.classList.toggle("has-error", !!m);
    err.textContent = m;
    input.setAttribute("aria-invalid", m ? "true" : "false");
    return !m;
  }
  Object.keys(f).forEach(function (k) {
    f[k].addEventListener("blur", function () { check(k); });
    f[k].addEventListener("input", function () { if (f[k].closest(".fld").classList.contains("has-error")) check(k); });
  });
  var counter = document.getElementById("msgCount");
  f.mensaje.addEventListener("input", function () { counter.textContent = f.mensaje.value.length + " / " + f.mensaje.maxLength; });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true, firstBad = null;
    Object.keys(f).forEach(function (k) { if (!check(k)) { valid = false; if (!firstBad) firstBad = f[k]; } });
    if (!valid) { firstBad.focus(); return; }
    document.getElementById("okName").textContent = f.nombre.value.trim();
    form.hidden = true; ok.hidden = false; ok.focus();
  });
  document.getElementById("again").addEventListener("click", function () {
    form.reset(); counter.textContent = "0 / " + f.mensaje.maxLength;
    Object.keys(f).forEach(function (k) { f[k].closest(".fld").classList.remove("has-error"); f[k].setAttribute("aria-invalid", "false"); });
    ok.hidden = true; form.hidden = false; f.nombre.focus();
  });
})();
