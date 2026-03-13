/**
 * scriptsMonitoreo.js
 * Depende de: dataMonitoreo.js
 */

var rowCounter = 0;

/* ── INIT ── */
window.onload = function () {
  // Poblar select de docentes
  var sel = document.getElementById('selectDocente');
  DOCENTES.forEach(function (d, i) {
    var o = document.createElement('option');
    o.value = i;
    o.text = d.apellido + ', ' + d.nombre;
    sel.appendChild(o);
  });

  // Poblar botones de meses
  var mg = document.getElementById('mesesGrid');
  MESES.forEach(function (m) {
    var btn = document.createElement('button');
    btn.className = 'mes-btn';
    btn.textContent = m;
    btn.type = 'button';
    btn.onclick = function () {
      this.classList.toggle('selected');
      setTimeout(guardarEstadoMon, 50);
    };
    mg.appendChild(btn);
  });

  buildDimensiones();
  restaurarEstadoMon();

  document.getElementById('fechaPeriodo').addEventListener('input', guardarEstadoMon);
  document.addEventListener('change', guardarEstadoMon);
  document.addEventListener('input', guardarEstadoMon);
};

/* ── DOCENTE CHANGE ── */
function onDocenteChange() {
  var idx = document.getElementById('selectDocente').value;
  if (!idx) return;
  document.getElementById('fechaPeriodo').value = '';
  document.querySelectorAll('.mes-btn').forEach(function (b) {
    b.classList.remove('selected');
  });
  rowCounter = 0;
  buildDimensiones();
  var d = DOCENTES[parseInt(idx)];
  document.getElementById('gradoSeccion').value = d.grado + ' "' + d.seccion + '" — Turno ' + d.turno;
  limpiarEstadoMon();
  guardarEstadoMon();
}

/* ── BUILD DIMENSIONES ── */
function buildDimensiones() {
  var c = document.getElementById('dimensionesContainer');
  c.innerHTML = '';
  DIMENSIONES.forEach(function (dim) {
    c.appendChild(buildDimBlock(dim));
  });
}

function buildDimBlock(dim) {
  var wrap = document.createElement('div');
  wrap.className = 'dim-block';
  wrap.id = 'dim_' + dim.id;
  var hdr = document.createElement('div');
  hdr.className = 'dim-header';
  hdr.innerHTML =
    '<strong>' +
    dim.nombre +
    '</strong><span>L = Logrado &nbsp;·&nbsp; EP = En proceso &nbsp;·&nbsp; AF = A fortalecer</span>';
  wrap.appendChild(hdr);
  var table = document.createElement('table');
  table.className = 'dim-table';
  table.innerHTML =
    '<thead><tr><th>Aspecto observado</th><th title="Logrado">L</th><th title="En proceso">EP</th><th title="A fortalecer">AF</th><th>Observaciones / Orientaciones</th><th style="width:32px;"></th></tr></thead>';
  var tbody = document.createElement('tbody');
  tbody.id = 'tbody_' + dim.id;
  table.appendChild(tbody);
  wrap.appendChild(table);
  var addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-row-btn';
  addBtn.textContent = '+ Agregar ítem';
  addBtn.onclick = (function (id) {
    return function () {
      addRow(id);
    };
  })(dim.id);
  wrap.appendChild(addBtn);
  for (var i = 0; i < 3; i++) addRowToBody(tbody, dim.id);
  return wrap;
}

function addRow(dimId) {
  var tbody = document.getElementById('tbody_' + dimId);
  addRowToBody(tbody, dimId);
  var inputs = tbody.querySelectorAll('.bullet-input');
  inputs[inputs.length - 1].focus();
}

function addRowToBody(tbody, dimId) {
  var ri = rowCounter++;
  var tr = document.createElement('tr');
  tr.id = 'row_' + ri;

  // Celda aspecto
  var tdAsp = document.createElement('td');
  var ta = document.createElement('textarea');
  ta.className = 'bullet-input';
  ta.id = 'asp_' + ri;
  ta.rows = 1;
  ta.placeholder = '• Escribí el aspecto observado...';
  ta.setAttribute('data-dim', dimId);
  ta.addEventListener(
    'keydown',
    (function (id) {
      return function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addRow(id);
        }
      };
    })(dimId),
  );
  ta.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });
  ta.addEventListener('focus', function () {
    if (this.value.trim() === '') this.value = '• ';
  });
  ta.addEventListener('blur', function () {
    if (this.value.trim() === '•') this.value = '';
  });
  tdAsp.appendChild(ta);
  tr.appendChild(tdAsp);

  // Celdas radio
  ['logrado', 'enproceso', 'fortalecer'].forEach(function (val) {
    var td = document.createElement('td');
    td.className = 'radio-cell ' + val;
    var inp = document.createElement('input');
    inp.type = 'radio';
    inp.name = 'est_' + ri;
    inp.value = val;
    inp.id = 'r_' + ri + '_' + val;
    var lbl = document.createElement('label');
    lbl.htmlFor = 'r_' + ri + '_' + val;
    td.appendChild(inp);
    td.appendChild(lbl);
    tr.appendChild(td);
  });

  // Celda observaciones
  var tdObs = document.createElement('td');
  var obs = document.createElement('input');
  obs.type = 'text';
  obs.className = 'obs-input';
  obs.id = 'obs_' + ri;
  obs.placeholder = 'Orientaciones...';
  tdObs.appendChild(obs);
  tr.appendChild(tdObs);

  // Botón eliminar
  var tdDel = document.createElement('td');
  var delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'del-btn';
  delBtn.innerHTML = '&times;';
  delBtn.title = 'Eliminar';
  delBtn.onclick = (function (id, tb) {
    return function () {
      var row = document.getElementById('row_' + id);
      if (tb.rows.length > 1) row.remove();
    };
  })(ri, tbody);
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);
  tbody.appendChild(tr);
}

/* ── GUARDAR PDF ── */
function guardarPDFMon() {
  var idx = document.getElementById('selectDocente').value;
  var d = DOCENTES[parseInt(idx)];
  var nombreArchivo = d.apellido + '_' + d.nombre + '_monitoreo';

  function afterPrint() {
    window.removeEventListener('afterprint', afterPrint);
    limpiarEstadoMon();
    document.getElementById('selectDocente').value = '';
    document.getElementById('gradoSeccion').value = '';
    document.getElementById('fechaPeriodo').value = '';
    document.querySelectorAll('.mes-btn').forEach(function (b) {
      b.classList.remove('selected');
    });
    document.getElementById('firmaDocenteNombre').textContent = 'Docente';
    document.getElementById('firmaDocenteCargo').textContent = '—';
    rowCounter = 0;
    buildDimensiones();
  }
  window.addEventListener('afterprint', afterPrint);
  document.querySelectorAll('input[type="radio"]').forEach(function (r) {
    r.checked = false;
  });
  document.title = nombreArchivo;
  window.print();
  document.title = 'Monitoreo Carpeta Didáctica — EP N°17';
}

/* ── PERSISTENCIA localStorage ── */
function guardarEstadoMon() {
  var dims = {};
  document.querySelectorAll('[id^="tbody_"]').forEach(function (tbody) {
    var dimId = tbody.id.replace('tbody_', '');
    var filas = [];
    tbody.querySelectorAll('tr').forEach(function (tr) {
      var aspecto = tr.querySelector('.bullet-input');
      var obs = tr.querySelector('.obs-input');
      var radio = tr.querySelector('input[type="radio"]:checked');
      filas.push({
        aspecto: aspecto ? aspecto.value : '',
        obs: obs ? obs.value : '',
        estado: radio ? radio.value : '',
      });
    });
    dims[dimId] = filas;
  });
  var meses = [];
  document.querySelectorAll('.mes-btn.selected').forEach(function (btn) {
    meses.push(btn.textContent);
  });
  var estado = {
    docente: document.getElementById('selectDocente').value,
    fecha: document.getElementById('fechaPeriodo').value,
    meses: meses,
    dims: dims,
  };
  try {
    localStorage.setItem(LS_KEY_MON, JSON.stringify(estado));
  } catch (e) {}
}

function restaurarEstadoMon() {
  try {
    var raw = localStorage.getItem(LS_KEY_MON);
    if (!raw) return;
    var e = JSON.parse(raw);
    if (e.docente) {
      document.getElementById('selectDocente').value = e.docente;
      onDocenteChange();
    }
    if (e.fecha) document.getElementById('fechaPeriodo').value = e.fecha;
    if (e.meses && e.meses.length) {
      document.querySelectorAll('.mes-btn').forEach(function (btn) {
        if (e.meses.indexOf(btn.textContent) !== -1) btn.classList.add('selected');
      });
    }
    if (e.dims) {
      Object.keys(e.dims).forEach(function (dimId) {
        var tbody = document.getElementById('tbody_' + dimId);
        if (!tbody) return;
        var filas = e.dims[dimId];
        filas.forEach(function (fila, idx) {
          while (tbody.querySelectorAll('tr').length <= idx) addRow(dimId);
          var row = tbody.querySelectorAll('tr')[idx];
          if (!row) return;
          var aspecto = row.querySelector('.bullet-input');
          var obs = row.querySelector('.obs-input');
          var radio = fila.estado ? row.querySelector('input[value="' + fila.estado + '"]') : null;
          if (aspecto) aspecto.value = fila.aspecto || '';
          if (obs) obs.value = fila.obs || '';
          if (radio) radio.checked = true;
        });
      });
    }
  } catch (err) {}
}

function limpiarEstadoMon() {
  try {
    localStorage.removeItem(LS_KEY_MON);
  } catch (e) {}
}
