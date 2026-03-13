/**
 * scriptsEvaluacion.js
 * Depende de: dataEvaluacion.js, pdfUtils.js
 */

var currentStep = 1;
var maxStep = 1;
var pdfCache = '';

/* ── INIT ── */
window.onload = function () {
  document.getElementById('inputFecha').value = new Date().toISOString().split('T')[0];

  // Poblar select de docentes
  var sel = document.getElementById('selectDocente');
  DOCENTES.forEach(function (d, i) {
    var o = document.createElement('option');
    o.value = i;
    o.text = d.apellido + ', ' + d.nombre + ' — ' + d.grado + ' "' + d.seccion + '" (' + d.turno + ')';
    sel.appendChild(o);
  });

  // Poblar select de áreas
  var asel = document.getElementById('inputArea');
  AREAS.forEach(function (a) {
    var o = document.createElement('option');
    o.value = a;
    o.text = a;
    asel.appendChild(o);
  });

  buildRubrica();
  restaurarEstado();
};

/* ── DOCENTE CHANGE ── */
function onDocenteChange() {
  var idx = document.getElementById('selectDocente').value;
  var card = document.getElementById('docenteCard');
  if (!idx) {
    card.classList.remove('visible');
    guardarEstado();
    return;
  }
  var d = DOCENTES[parseInt(idx)];
  document.getElementById('dcTurno').textContent = d.turno;
  document.getElementById('dcGrado').textContent = d.grado;
  document.getElementById('dcSeccion').textContent = d.seccion;
  document.getElementById('dcEmail').textContent = d.email;
  card.classList.add('visible');
  limpiarEstado();
  guardarEstado();
}

/* ── BUILD RÚBRICA ── */
function buildRubrica() {
  var container = document.getElementById('rubricaContainer');
  container.innerHTML = '';
  var idx = 0;
  CRITERIOS.forEach(function (sec) {
    var div = document.createElement('div');
    div.className = 'rubrica-section';
    var rows = '';
    sec.items.forEach(function (item) {
      var i = idx;
      var radios = '';
      for (var n = 1; n <= 5; n++) {
        radios +=
          '<label class="radio-opt" onclick="guardarEstado()">' +
          '<input type="radio" name="crit_' +
          i +
          '" value="' +
          n +
          '"/>' +
          '<div class="radio-circle">' +
          n +
          '</div></label>';
      }
      rows += '<tr><td>' + item + '</td><td colspan="5"><div class="radio-group">' + radios + '</div></td></tr>';
      idx++;
    });
    div.innerHTML =
      '<div class="rubrica-section-header">' +
      sec.seccion +
      '</div>' +
      '<table class="rubrica-table"><thead><tr>' +
      '<th>Criterio de evaluación</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>' +
      '</tr></thead><tbody>' +
      rows +
      '</tbody></table>';
    container.appendChild(div);
  });
}

/* ── NAVEGACIÓN ── */
function goToStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;
  for (var i = 1; i <= 5; i++) {
    var p = document.getElementById('panel' + i);
    var s = document.getElementById('step' + i);
    if (p) p.classList.remove('active');
    if (s) {
      s.classList.remove('active', 'done');
      if (i < n) s.classList.add('done');
      if (i === n) s.classList.add('active');
    }
  }
  document.getElementById('panel' + n).classList.add('active');
  document.getElementById('progressFill').style.width = n * 25 + '%';
  currentStep = n;
  if (n > maxStep) maxStep = n;
  if (n === 4) setTimeout(generarPreview, 150);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  guardarEstado();
}

/* ── VALIDACIÓN ── */
function validateStep(step) {
  if (step === 1) {
    var ok =
      document.getElementById('selectDocente').value !== '' &&
      document.getElementById('inputFecha').value !== '' &&
      document.getElementById('inputArea').value !== '' &&
      document.getElementById('inputContenido').value.trim() !== '' &&
      document.getElementById('inputAlumnos').value !== '';
    document.getElementById('error1').style.display = ok ? 'none' : 'block';
    return ok;
  }
  if (step === 2) {
    var total = 0;
    CRITERIOS.forEach(function (s) {
      total += s.items.length;
    });
    var checked = 0;
    for (var i = 0; i < total; i++) {
      if (document.querySelector('input[name="crit_' + i + '"]:checked')) checked++;
    }
    var ok = checked === total;
    var err = document.getElementById('error2');
    err.style.display = ok ? 'none' : 'block';
    if (!ok) err.textContent = 'Por favor puntuá todos los criterios (' + checked + '/' + total + ' completados).';
    return ok;
  }
  return true;
}

/* ── GUARDAR PDF ── */
function guardarPDF() {
  window.print();
}

/* ── NUEVA EVALUACIÓN ── */
function nuevaEvaluacion() {
  limpiarEstado();
  document.getElementById('selectDocente').value = '';
  document.getElementById('docenteCard').classList.remove('visible');
  document.getElementById('inputArea').value = '';
  document.getElementById('inputContenido').value = '';
  document.getElementById('inputAlumnos').value = '';
  ['fodaFortalezas', 'fodaDebilidades', 'fodaOportunidades', 'fodaAmenazas'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  pdfCache = '';
  buildRubrica();
  currentStep = 1;
  maxStep = 1;
  goToStep(1);
}

/* ── PERSISTENCIA localStorage ── */
function guardarEstado() {
  var total = 0;
  CRITERIOS.forEach(function (s) {
    total += s.items.length;
  });
  var puntajes = [];
  for (var i = 0; i < total; i++) {
    var el = document.querySelector('input[name="crit_' + i + '"]:checked');
    puntajes.push(el ? el.value : '');
  }
  var estado = {
    docente: document.getElementById('selectDocente').value,
    fecha: document.getElementById('inputFecha').value,
    area: document.getElementById('inputArea').value,
    contenido: document.getElementById('inputContenido').value,
    alumnos: document.getElementById('inputAlumnos').value,
    fortalezas: document.getElementById('fodaFortalezas').value,
    debilidades: document.getElementById('fodaDebilidades').value,
    oportunidades: document.getElementById('fodaOportunidades').value,
    amenazas: document.getElementById('fodaAmenazas').value,
    puntajes: puntajes,
    paso: currentStep,
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(estado));
  } catch (e) {}
}

function restaurarEstado() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    var e = JSON.parse(raw);
    if (e.docente) document.getElementById('selectDocente').value = e.docente;
    if (e.fecha) document.getElementById('inputFecha').value = e.fecha;
    if (e.area) document.getElementById('inputArea').value = e.area;
    if (e.contenido) document.getElementById('inputContenido').value = e.contenido;
    if (e.alumnos) document.getElementById('inputAlumnos').value = e.alumnos;
    if (e.fortalezas) document.getElementById('fodaFortalezas').value = e.fortalezas;
    if (e.debilidades) document.getElementById('fodaDebilidades').value = e.debilidades;
    if (e.oportunidades) document.getElementById('fodaOportunidades').value = e.oportunidades;
    if (e.amenazas) document.getElementById('fodaAmenazas').value = e.amenazas;
    if (e.puntajes && e.puntajes.length) {
      e.puntajes.forEach(function (val, i) {
        if (val) {
          var el = document.querySelector('input[name="crit_' + i + '"][value="' + val + '"]');
          if (el) el.checked = true;
        }
      });
    }
    if (e.docente) document.getElementById('docenteCard').classList.add('visible');
    if (e.paso && e.paso > 1) goToStep(e.paso);
  } catch (err) {}
}

function limpiarEstado() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {}
}

// /* ── BUILD HTML DEL PDF ── */
// function _buildPDFHTML() {
//   var idx = parseInt(document.getElementById('selectDocente').value);
//   var d = DOCENTES[idx];
//   var fecha = document.getElementById('inputFecha').value.split('-').reverse().join('/');
//   var total = 0;
//   CRITERIOS.forEach(function (s) {
//     total += s.items.length;
//   });
//   var puntajes = [];
//   for (var i = 0; i < total; i++) {
//     var el = document.querySelector('input[name="crit_' + i + '"]:checked');
//     puntajes.push(el ? parseInt(el.value) : 0);
//   }
//   var foda = {
//     fortalezas: document.getElementById('fodaFortalezas').value,
//     debilidades: document.getElementById('fodaDebilidades').value,
//     oportunidades: document.getElementById('fodaOportunidades').value,
//     amenazas: document.getElementById('fodaAmenazas').value,
//   };

//   var filas = '';
//   var ci = 0;
//   CRITERIOS.forEach(function (sec) {
//     filas +=
//       '<tr><td colspan="6" style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-weight:800;padding:7px 12px;font-size:11px;letter-spacing:.3px;">' +
//       sec.seccion +
//       '</td></tr>';
//     sec.items.forEach(function (item) {
//       var celdas = '';
//       for (var n = 1; n <= 5; n++) {
//         if (puntajes[ci] === n) {
//           celdas +=
//             '<td style="text-align:center;width:36px;"><div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;margin:auto;">' +
//             n +
//             '</div></td>';
//         } else {
//           celdas += '<td style="text-align:center;width:36px;color:#ccc;font-size:12px;">' + n + '</td>';
//         }
//       }
//       filas +=
//         '<tr style="border-bottom:1px solid #e8f0fe;"><td style="padding:7px 12px;font-size:10.5px;line-height:1.5;color:#1e3a5f;font-weight:600;">' +
//         item +
//         '</td>' +
//         celdas +
//         '</tr>';
//       ci++;
//     });
//   });

//   var sum = puntajes.reduce(function (a, b) {
//     return a + b;
//   }, 0);
//   var avg = (sum / puntajes.length).toFixed(1);
//   var logoB64 = document.getElementById('logoB64').value;
//   var firmaB64 = document.getElementById('firmaB64').value;

//   return (
//     '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
//     '<style>@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");' +
//     'body{font-family:Nunito,Arial,sans-serif;margin:0;padding:24px 28px;color:#1e3a5f;background:white;font-size:11px;}' +
//     '.hdr{display:flex;align-items:center;gap:16px;border-bottom:3px solid #667eea;padding-bottom:14px;margin-bottom:16px;}' +
//     '.logo{width:70px;height:70px;border-radius:50%;border:2px solid #764ba2;}' +
//     '.tit{font-size:17px;font-weight:800;color:#1e40af;}' +
//     '.sub{font-size:11px;color:#5a7a9a;margin-top:3px;font-weight:600;}' +
//     '.datos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;background:#eff6ff;padding:12px;border-radius:8px;border-left:4px solid #3b82f6;}' +
//     '.dato{font-size:10.5px;font-weight:600;color:#5a7a9a;}.dato strong{color:#1e40af;display:block;font-size:11.5px;}' +
//     '.escala{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;}' +
//     '.eb{display:flex;align-items:center;gap:4px;background:#eff6ff;border-radius:20px;padding:3px 8px;font-size:9.5px;color:#1e40af;font-weight:700;}' +
//     '.ebn{width:17px;height:17px;background:#1e40af;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;}' +
//     'table{width:100%;border-collapse:collapse;margin-bottom:14px;}' +
//     'table th{background:#1e40af;color:white;padding:7px;text-align:center;font-size:10px;font-weight:800;}' +
//     'table th:first-child{text-align:left;padding-left:12px;}' +
//     'table tr:nth-child(even){background:#f8fbff;}' +
//     '.score{background:#1e40af;color:white;border-radius:8px;padding:10px 16px;text-align:center;font-weight:800;font-size:13px;margin-bottom:14px;}' +
//     '.foda{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}' +
//     '.fb{border:1.5px solid #bfdbfe;border-radius:8px;overflow:hidden;}' +
//     '.ft{background:#1e40af;color:white;font-weight:800;padding:5px 10px;font-size:10px;letter-spacing:.4px;}' +
//     '.fc{padding:8px 10px;font-size:10.5px;min-height:52px;line-height:1.6;color:#1e3a5f;font-weight:600;}' +
//     '.firmas{display:flex;justify-content:space-around;margin-top:20px;padding-top:16px;border-top:2px solid #93c5fd;}' +
//     '.fbox{text-align:center;width:210px;}.fimg{max-width:150px;max-height:65px;}' +
//     '.fesp{height:65px;border-bottom:1.5px dashed #aaa;}' +
//     '.flin{margin-top:6px;}.fnom{font-weight:800;font-size:11px;color:#1e3a5f;}.fcar{font-size:9.5px;color:#5a7a9a;font-weight:600;}' +
//     '</style></head><body>' +
//     '<div class="hdr"><img src="data:image/jpeg;base64,' +
//     logoB64 +
//     '" class="logo"/>' +
//     '<div><div class="tit">RÚBRICA DE EVALUACIÓN DOCENTE</div>' +
//     '<div class="sub">EP N°17 "Luis Castells" · Directora: Quinteros Vanesa</div></div></div>' +
//     '<div class="datos">' +
//     '<div class="dato">Fecha<strong>' +
//     fecha +
//     '</strong></div>' +
//     '<div class="dato">Docente<strong>' +
//     d.nombre +
//     ' ' +
//     d.apellido +
//     '</strong></div>' +
//     '<div class="dato">Turno<strong>' +
//     d.turno +
//     '</strong></div>' +
//     '<div class="dato">Grado / Sección<strong>' +
//     d.grado +
//     ' "' +
//     d.seccion +
//     '"</strong></div>' +
//     '<div class="dato">Área<strong>' +
//     document.getElementById('inputArea').value +
//     '</strong></div>' +
//     '<div class="dato">Contenido<strong>' +
//     document.getElementById('inputContenido').value +
//     '</strong></div>' +
//     '<div class="dato">Estudiantes<strong>' +
//     document.getElementById('inputAlumnos').value +
//     '</strong></div>' +
//     '</div>' +
//     '<div class="escala">' +
//     ESCALA_PDF.map(function (e) {
//       return '<div class="eb"><div class="ebn">' + e[0] + '</div>' + e[1] + '</div>';
//     }).join('') +
//     '</div>' +
//     '<div style="font-weight:800;color:#1e40af;margin-bottom:8px;font-size:12px;">¿Qué cuestiones deben ocurrir en la enseñanza?</div>' +
//     '<table><thead><tr><th style="width:56%;">Criterio de evaluación</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>' +
//     '<tbody>' +
//     filas +
//     '</tbody></table>' +
//     '<div class="score">Promedio general: ' +
//     avg +
//     ' / 5 · ' +
//     puntajes.length +
//     ' criterios evaluados</div>' +
//     '<div style="font-weight:800;color:#1e40af;margin-bottom:8px;font-size:12px;">Análisis FODA</div>' +
//     '<div class="foda">' +
//     '<div class="fb"><div class="ft">FORTALEZAS</div><div class="fc">' +
//     (foda.fortalezas || '') +
//     '</div></div>' +
//     '<div class="fb"><div class="ft">DEBILIDADES</div><div class="fc">' +
//     (foda.debilidades || '') +
//     '</div></div>' +
//     '<div class="fb"><div class="ft">OPORTUNIDADES</div><div class="fc">' +
//     (foda.oportunidades || '') +
//     '</div></div>' +
//     '<div class="fb"><div class="ft">AMENAZAS</div><div class="fc">' +
//     (foda.amenazas || '') +
//     '</div></div>' +
//     '</div>' +
//     '<div class="firmas">' +
//     '<div class="fbox"><img src="data:image/png;base64,' +
//     firmaB64 +
//     '" class="fimg"/>' +
//     '<div class="flin"><div class="fnom">QUINTEROS VANESA</div><div class="fcar">Directora EP N°17 "Luis Castells"</div></div></div>' +
//     '<div class="fbox"><div class="fesp"></div>' +
//     '<div class="flin"><div class="fnom">' +
//     d.nombre +
//     ' ' +
//     d.apellido +
//     '</div>' +
//     '<div class="fcar">' +
//     d.grado +
//     ' "' +
//     d.seccion +
//     '" — Turno ' +
//     d.turno +
//     '</div></div></div>' +
//     '</div></body></html>'
//   );
// }
