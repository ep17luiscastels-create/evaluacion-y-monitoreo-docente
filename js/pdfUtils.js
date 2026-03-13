/**
 * pdfUtils.js — Módulo de generación de PDF usando html2pdf.js
 * Requiere en el HTML:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
 */

var PDFUtils = (function () {
  function descargar(htmlString, nombreArchivo) {
    var nombre = nombreArchivo || 'documento.pdf';

    // Contenedor temporal oculto para renderizar el HTML
    var contenedor = document.createElement('div');
    contenedor.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;';
    contenedor.innerHTML = htmlString;
    document.body.appendChild(contenedor);

    var opciones = {
      margin: 10,
      filename: nombre,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opciones)
      .from(contenedor)
      .save()
      .then(function () {
        document.body.removeChild(contenedor);
      });
  }

  return { descargar: descargar };
})();
