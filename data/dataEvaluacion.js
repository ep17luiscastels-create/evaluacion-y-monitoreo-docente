// dataEvaluacion.js — Datos institucionales de EP N°17

var DOCENTES = [
  {
    nombre: 'Yesica',
    apellido: 'VELAZQUEZ',
    email: 'yvelazquez@abc.gob.ar',
    turno: 'Mañana',
    grado: '1°',
    seccion: 'A',
  },
  {
    nombre: 'Maisa Elida',
    apellido: 'BUDIÑO',
    email: 'maisabudino@abc.gob.ar',
    turno: 'Mañana',
    grado: '2°',
    seccion: 'A',
  },
  { nombre: 'Analia', apellido: 'VELIZ', email: 'anveliz1@abc.gob.ar', turno: 'Mañana', grado: '3°', seccion: 'A' },
  { nombre: 'Lilian', apellido: 'BELOVIC', email: 'libelovic@abc.gob.ar', turno: 'Mañana', grado: '4°', seccion: 'A' },
  {
    nombre: 'Pamela',
    apellido: 'FERREIRA DASILVA',
    email: 'paferreira@abc.gob.ar',
    turno: 'Mañana',
    grado: '5°',
    seccion: 'A',
  },
  {
    nombre: 'Yesica',
    apellido: 'TILLERIA',
    email: 'yestilleria@abc.gob.ar',
    turno: 'Mañana',
    grado: '6°',
    seccion: 'A',
  },
  { nombre: 'Viviana', apellido: 'ZELAYA', email: 'vizelaya@abc.gob.ar', turno: 'Tarde', grado: '2°', seccion: 'B' },
  { nombre: 'Noemi', apellido: 'LOPEZ', email: 'noelopez3@abc.gob.ar', turno: 'Tarde', grado: '3°', seccion: 'B' },
  { nombre: 'Lilian', apellido: 'BELOVIC', email: 'libelovic@abc.gob.ar', turno: 'Tarde', grado: '4°', seccion: 'B' },
  { nombre: 'Yamila', apellido: 'CABRERA', email: 'yacabrera3@abc.gob.ar', turno: 'Tarde', grado: '5°', seccion: 'B' },
  {
    nombre: 'Veronica',
    apellido: 'DESTEFANO',
    email: 'vdestefano1@abc.gob.ar',
    turno: 'Tarde',
    grado: '6°',
    seccion: 'B',
  },
  {
    nombre: 'Lucia',
    apellido: 'PERUNETTE',
    email: 'luperunette@abc.gob.ar',
    turno: 'Tarde',
    grado: '1°',
    seccion: 'A',
  },
  {
    nombre: 'Leonardo',
    apellido: 'Tricotti',
    email: 'ltricotti@abc.gob.ar',
    turno: 'Tarde',
    grado: '1°',
    seccion: 'A',
  },
];

var CRITERIOS = [
  {
    seccion: 'Clima áulico',
    items: [
      'Propicia un espacio áulico dinámico y participativo de cordialidad y amabilidad.',
      'Genera un vínculo afectuoso de escucha y diálogo entre los alumnos y docente.',
      'Organiza la actividad a partir de un hacer grupal, en parejas, grupos pequeños, en función de los objetivos de cada momento.',
    ],
  },
  {
    seccion: 'Ambiente Alfabetizador',
    items: [
      'Se observa en el aula materiales escritos que sirvan como fuentes seguras de información para generar autonomía en su proceso lector y escritor.',
    ],
  },
  {
    seccion: 'Presentación de los contenidos',
    items: [
      'Los contenidos y las orientaciones sugeridas en los documentos de trabajo propuestos por DPNP, se enseñan de manera articulada con los ejes del PI.',
      'Inicia la clase con una presentación que revisa y resignifica el contenido a trabajar.',
      'El tiempo didáctico es adecuado a los objetivos de aprendizaje y a las estrategias elegidas.',
      'Se ofrecen situaciones de aprendizaje en las que los alumnos vinculan los contenidos con situaciones reales y cotidianas.',
      'Se aborda un mismo contenido con distintos grados de complejidad y/o de distintas perspectivas.',
      'Las estrategias de enseñanza son diversas en recursos: pizarrón, Tics, material concreto, texto, etc.',
      'Se implementan estrategias inclusivas para alumnos que aún no alcanzan los objetivos propuestos.',
      'La intervención del docente planifica en la actividad recorridos que atraviesan situaciones de enseñanza de: Lectura por sí mismo de los alumnos (individual y colectiva). Escritura por si mismo (individual/colectiva).',
      'Se generan espacios de revisión de escritura individual/colectiva.',
    ],
  },
  {
    seccion: 'Evaluación',
    items: [
      'Los instrumentos de evaluación ofrecen consignas claras y comunica a los alumnos los criterios con los que se los evalúa.',
      'Se promueve la autonomía desde el descubrimiento y la reflexión.',
      'El acompañamiento genera la confianza para plantear inquietudes y necesidades de aprendizajes.',
      'Se ofrecen instancias que permitan a los alumnos identificar avances, dificultades y sugerencias para continuar mejorando.',
    ],
  },
];

var AREAS = [
  'Prácticas del Lenguaje',
  'Matemática',
  'Ciencias Sociales',
  'Ciencias Naturales',
  'Educación Artística',
  'Educación Física',
  'Inglés',
  'ESI — Educación Sexual Integral',
  'Educación Digital',
  'Formación Ética y Ciudadana',
];

var ESCALA_PDF = [
  [1, 'Sobresaliente / Supera expectativas'],
  [2, 'Muy Bueno / Logrado'],
  [3, 'Bueno / En proceso'],
  [4, 'Revisitar las Prácticas / Para mejorar'],
  [5, 'No logra organizar y ejecutar acciones'],
];

// Clave localStorage compartida con Monitoreo
var LS_KEY = 'ep17_eval';
