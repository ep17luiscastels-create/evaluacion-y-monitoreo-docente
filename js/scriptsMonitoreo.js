/**
 * scriptsMonitoreo.js
 * Depende de: dataMonitoreo.js, pdfUtils.js
 *
 * CAMBIO: guardarPDFMon() ahora llama a PDFUtils.enviarAlScript()
 * justo antes de window.print(). Todo lo demás intacto.
 */

var rowCounter = 0;

/* ── INIT ── */
window.onload = function () {
  var sel = document.getElementById('selectDocente');
  DOCENTES.forEach(function (d, i) {
    var o = document.createElement('option');
    o.value = i;
    o.text = d.apellido + ', ' + d.nombre;
    sel.appendChild(o);
  });

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

  var tdObs = document.createElement('td');
  var obs = document.createElement('input');
  obs.type = 'text';
  obs.className = 'obs-input';
  obs.id = 'obs_' + ri;
  obs.placeholder = 'Orientaciones...';
  tdObs.appendChild(obs);
  tr.appendChild(tdObs);

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

/* ── BUILD HTML DEL PDF ── */
function _buildPDFHTML() {
  var idx = parseInt(document.getElementById('selectDocente').value);
  var d = DOCENTES[idx];
  var mesesSel = Array.from(document.querySelectorAll('.mes-btn.selected')).map(function (b) {
    return b.textContent;
  });
  var periodo = document.getElementById('fechaPeriodo').value;

  var dimData = DIMENSIONES.map(function (dim) {
    var tbody = document.getElementById('tbody_' + dim.id);
    var items = [];
    Array.from(tbody.rows).forEach(function (row) {
      var asp = row.querySelector('.bullet-input');
      var checked = row.querySelector('input[type=radio]:checked');
      var obs = row.querySelector('.obs-input');
      var aspVal = asp ? asp.value.trim() : '';
      if (aspVal && aspVal !== '•') {
        items.push({ asp: aspVal, estado: checked ? checked.value : '', obs: obs ? obs.value.trim() : '' });
      }
    });
    return { nombre: dim.nombre, items: items };
  });

  var filasHTML = '';
  dimData.forEach(function (dim) {
    if (!dim.items.length) return;
    filasHTML +=
      '<tr><td colspan="3" style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;font-weight:800;padding:7px 12px;font-size:11px;">' +
      dim.nombre +
      '</td></tr>';
    dim.items.forEach(function (item, i) {
      var badge = item.estado
        ? '<span style="background:' +
          ESTADO_COLOR[item.estado] +
          ';color:' +
          ESTADO_TEXT[item.estado] +
          ';padding:3px 10px;border-radius:12px;font-size:10px;font-weight:800;">' +
          ESTADO_LABEL[item.estado] +
          '</span>'
        : '<span style="color:#ccc;">—</span>';
      var bg = i % 2 === 0 ? 'white' : '#f8fbff';
      filasHTML +=
        '<tr style="border-bottom:1px solid #e8f0fe;background:' +
        bg +
        ';">' +
        '<td style="padding:8px 12px;font-size:11.5px;font-weight:600;color:#1e3a5f;line-height:1.5;width:42%;">' +
        item.asp.replace(/\n/g, '<br>') +
        '</td>' +
        '<td style="text-align:center;padding:8px;width:16%;">' +
        badge +
        '</td>' +
        '<td style="padding:8px 12px;font-size:11px;color:#5a7a9a;font-weight:600;">' +
        (item.obs || '') +
        '</td></tr>';
    });
  });

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>body{font-family:Arial,sans-serif;margin:0;padding:24px 28px;color:#1e3a5f;font-size:11px;}' +
    '.hdr{display:flex;align-items:center;gap:16px;border-bottom:3px solid #667eea;padding-bottom:14px;margin-bottom:16px;}' +
    '.tit{font-size:17px;font-weight:800;color:#1e40af;}.sub{font-size:11px;color:#5a7a9a;margin-top:3px;font-weight:600;}' +
    '.datos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;background:#eff6ff;padding:12px;border-radius:8px;border-left:4px solid #3b82f6;}' +
    '.dato{font-size:10.5px;font-weight:600;color:#5a7a9a;}.dato strong{color:#1e40af;display:block;font-size:11.5px;}' +
    '.meses{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}' +
    '.mes{background:#1e40af;color:white;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:800;}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:16px;}' +
    'table th{background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;padding:8px 12px;text-align:left;font-size:11px;font-weight:800;}' +
    '.firmas{display:flex;justify-content:space-around;margin-top:24px;padding-top:16px;border-top:2px solid #93c5fd;}' +
    '.fbox{text-align:center;width:200px;}.fesp{height:60px;border-bottom:1.5px dashed #aaa;}' +
    '.fnom{font-weight:800;font-size:11px;color:#1e3a5f;margin-top:6px;}.fcar{font-size:9.5px;color:#5a7a9a;font-weight:600;}' +
    '</style></head><body>' +
    '<div class="hdr"><div><div class="tit">MONITOREO DE CARPETA DIDÁCTICA</div>' +
    '<div class="sub">EP N°17 "Luis Castells" · Directora: Quinteros Vanesa</div></div></div>' +
    '<div class="datos">' +
    '<div class="dato">Docente<strong>' +
    d.nombre +
    ' ' +
    d.apellido +
    '</strong></div>' +
    '<div class="dato">Grado / Sección<strong>' +
    d.grado +
    ' "' +
    d.seccion +
    '" — ' +
    d.turno +
    '</strong></div>' +
    '<div class="dato">Período<strong>' +
    (periodo || '—') +
    '</strong></div></div>' +
    (mesesSel.length
      ? '<div class="meses">' +
        mesesSel
          .map(function (m) {
            return '<span class="mes">' + m + '</span>';
          })
          .join('') +
        '</div>'
      : '') +
    '<table><thead><tr><th>Aspecto observado</th><th style="text-align:center;width:16%;">Estado</th><th>Observaciones / Orientaciones</th></tr></thead>' +
    '<tbody>' +
    filasHTML +
    '</tbody></table>' +
    '<div class="firmas">' +
    '<div class="fbox"><div class="fesp"></div><div class="fnom">QUINTEROS VANESA</div><div class="fcar">Directora EP N°17 "Luis Castells"</div></div>' +
    '<div class="fbox"><div class="fesp"></div><div class="fnom">' +
    d.nombre +
    ' ' +
    d.apellido +
    '</div><div class="fcar">' +
    d.grado +
    ' "' +
    d.seccion +
    '" — Turno ' +
    d.turno +
    '</div></div>' +
    '</div></body></html>'
  );
}

/* ── GUARDAR PDF ── */
function guardarPDFMon() {
  var idxVal = document.getElementById('selectDocente').value;
  if (!idxVal) return;
  var d = DOCENTES[parseInt(idxVal)];

  // Construir HTML del documento
  var html = _buildPDFHTML();

  // Enviar al Classroom en segundo plano (no bloquea el print)
  PDFUtils.enviarAlScript(
    html,
    d.email || '',
    d.nombre + ' ' + d.apellido,
    'monitoreo',
    function (urlPDF) {
      console.log('PDF subido al Classroom: ' + urlPDF);
    },
    function (err) {
      console.warn('No se pudo subir al Classroom: ' + err);
    },
  );

  // Imprimir como siempre
  var nombreArchivo = d.apellido + '_' + d.nombre + '_monitoreo';
  function afterPrint() {
    window.removeEventListener('afterprint', afterPrint);
    document.getElementById('selectDocente').value = '';
    document.getElementById('gradoSeccion').value = '';
    document.getElementById('fechaPeriodo').value = '';
    document.querySelectorAll('.mes-btn').forEach(function (b) {
      b.classList.remove('selected');
    });
    rowCounter = 0;
    buildDimensiones();
  }
  window.addEventListener('afterprint', afterPrint);
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
        e.dims[dimId].forEach(function (fila, idx) {
          while (tbody.querySelectorAll('tr').length <= idx) addRow(dimId);
          var row = tbody.querySelectorAll('tr')[idx];
          if (!row) return;
          var asp = row.querySelector('.bullet-input');
          var obs = row.querySelector('.obs-input');
          var radio = fila.estado ? row.querySelector('input[value="' + fila.estado + '"]') : null;
          if (asp) asp.value = fila.aspecto || '';
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
