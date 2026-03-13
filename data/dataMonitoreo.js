// dataMonitoreo.js — Datos institucionales EP N°17 (Monitoreo de Carpeta Didáctica)

// Reutiliza la misma lista de docentes que Evaluacion
var DOCENTES = [
  { nombre: "Yesica",      apellido: "VELAZQUEZ",        turno: "Mañana", grado: "1°", seccion: "A" },
  { nombre: "Maisa Elida", apellido: "BUDIÑO",           turno: "Mañana", grado: "2°", seccion: "A" },
  { nombre: "Analia",      apellido: "VELIZ",            turno: "Mañana", grado: "3°", seccion: "A" },
  { nombre: "Lilian",      apellido: "BELOVIC",          turno: "Mañana", grado: "4°", seccion: "A" },
  { nombre: "Pamela",      apellido: "FERREIRA DASILVA", turno: "Mañana", grado: "5°", seccion: "A" },
  { nombre: "Yesica",      apellido: "TILLERIA",         turno: "Mañana", grado: "6°", seccion: "A" },
  { nombre: "Viviana",     apellido: "ZELAYA",           turno: "Tarde",  grado: "2°", seccion: "B" },
  { nombre: "Noemi",       apellido: "LOPEZ",            turno: "Tarde",  grado: "3°", seccion: "B" },
  { nombre: "Lilian",      apellido: "BELOVIC",          turno: "Tarde",  grado: "4°", seccion: "B" },
  { nombre: "Yamila",      apellido: "CABRERA",          turno: "Tarde",  grado: "5°", seccion: "B" },
  { nombre: "Veronica",    apellido: "DESTEFANO",        turno: "Tarde",  grado: "6°", seccion: "B" },
  { nombre: "Lucia",       apellido: "PERUNETTE",        turno: "Tarde",  grado: "1°", seccion: "A" }
];

var MESES = [
  "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO",
  "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

var DIMENSIONES = [
  { id: "carpeta",       nombre: "Carpeta didáctica" },
  { id: "planificacion", nombre: "Planificación" }
];

// Etiquetas y colores de estado para PDF
var ESTADO_LABEL = { logrado: "Logrado", enproceso: "En proceso", fortalecer: "A fortalecer" };
var ESTADO_COLOR = { logrado: "#1e40af", enproceso: "#3b82f6", fortalecer: "#93c5fd" };
var ESTADO_TEXT  = { logrado: "white",   enproceso: "white",    fortalecer: "#1e3a5f" };

// Clave localStorage propia de Monitoreo
var LS_KEY_MON = "ep17_mon";
