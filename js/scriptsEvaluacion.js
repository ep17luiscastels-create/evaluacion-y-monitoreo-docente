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
    limpiarEstado();
    return;
  }

  // Limpiar todos los campos antes de cargar el nuevo docente
  document.getElementById('inputArea').value = '';
  document.getElementById('inputContenido').value = '';
  document.getElementById('inputAlumnos').value = '';
  ['fodaFortalezas', 'fodaDebilidades', 'fodaOportunidades', 'fodaAmenazas'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  buildRubrica(); // resetea todos los radios

  // Resetear navegación al paso 1
  currentStep = 1;
  maxStep = 1;

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
      var celdas = '';
      for (var n = 1; n <= 5; n++) {
        celdas +=
          '<th><label class="radio-opt" onclick="guardarEstado()"><input type="radio" name="crit_' +
          i +
          '" value="' +
          n +
          '"/><div class="radio-circle">' +
          n +
          '</div></label></th>';
      }
      rows += '<tr><td>' + item + '</td>' + celdas + '</tr>';
      idx++;
    });
    div.innerHTML =
      '<div class="rubrica-section-header">' +
      sec.seccion +
      '</div>' +
      '<table class="rubrica-table"><thead><tr>' +
      '<th>Criterio de evaluación</th><th></th><th></th><th></th><th></th><th></th>' +
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
  var idx = document.getElementById('selectDocente').value;
  var d = DOCENTES[parseInt(idx)];
  var nombreArchivo = d.apellido + '_' + d.nombre + '_evaluacion';

  function afterPrint() {
    window.removeEventListener('afterprint', afterPrint);
    limpiarEstado();
    nuevaEvaluacion();
  }
  window.addEventListener('afterprint', afterPrint);

  document.title = nombreArchivo;
  window.print();
  document.title = 'Evaluación Docente — EP N°17';
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
