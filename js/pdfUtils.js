/**
 * pdfUtils.js — EP N°17
 */

var APPS_SCRIPT_URL = 'https://escuelaep17-backend.onrender.com/api/evaluaciones/enviar';

var PDFUtils = (function () {
  function descargar() {
    window.print();
  }

  function enviarAlScript(htmlStr, emailDocente, nombreDocente, tipo, onExito, onError) {
    var payload = JSON.stringify({
      emailDocente: emailDocente,
      nombreDocente: nombreDocente,
      tipoFormulario: tipo,
      htmlPDF: htmlStr,
    });

    console.log('Enviando a:', APPS_SCRIPT_URL);
    console.log('Payload size:', payload.length, 'chars');

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script no soporta CORS — no podemos leer respuesta
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    })
      .then(function () {
        // Con no-cors la respuesta es opaca pero el POST llegó al script
        if (typeof onExito === 'function') onExito('');
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
