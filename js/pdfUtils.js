/**
 * pdfUtils.js — EP N°17
 * Mantiene window.print() intacto.
 * Agrega enviarAlScript() para subir al Classroom en paralelo.
 */

// ── Reemplazar con la URL real al publicar el Apps Script ──────
var APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzmpKC-k9Kq6RMiWXrGqvNSkFxgLCThyimyfCC73YWnCaU3hpFkJLsNRrDlkO4PTOV4tg/exec';

var PDFUtils = (function () {
  /* Igual que antes — no se toca */
  function descargar() {
    window.print();
  }

  /*
   * enviarAlScript()
   * Llama al Apps Script con los datos del formulario.
   * El script genera el PDF, lo sube al Classroom del docente
   * (lo crea si no existe) y devuelve la URL del PDF.
   *
   * @param {string}   htmlStr        HTML completo del documento
   * @param {string}   emailDocente   Email del docente
   * @param {string}   nombreDocente  Nombre completo
   * @param {string}   tipo           "evaluacion" | "monitoreo"
   * @param {function} onExito        callback(urlPDF)
   * @param {function} onError        callback(mensaje)
   */
  function enviarAlScript(htmlStr, emailDocente, nombreDocente, tipo, onExito, onError) {
    var payload = JSON.stringify({
      emailDocente: emailDocente,
      nombreDocente: nombreDocente,
      tipoFormulario: tipo,
      htmlPDF: htmlStr,
    });

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // text/plain evita el preflight CORS que bloquea Apps Script
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.ok) {
          if (typeof onExito === 'function') onExito(data.urlPDF);
        } else {
          if (typeof onError === 'function') onError(data.mensaje || 'Error desconocido');
        }
      })
      .catch(function (err) {
        if (typeof onError === 'function') onError('Error de red: ' + err.message);
      });
  }

  return {
    descargar: descargar,
    enviarAlScript: enviarAlScript,
  };
})();
