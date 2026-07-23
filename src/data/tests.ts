export interface TestQuestion {
  p: string;
  r: string[];
}

export interface TestModule {
  id: number;
  titulo: string;
  desc: string;
  preguntas: TestQuestion[];
}

export const testModules: TestModule[] = [
  {
    id: 1, titulo: 'Test de Liderazgo',
    desc: 'Evalúa tu capacidad para guiar equipos y tomar decisiones.',
    preguntas: [
      { p: 'Cuando un equipo discute, tú:', r: ['Busco consenso mediando', 'Impongo mi criterio', 'Dejo que se calmen solos'] },
      { p: 'Ante un error de un compañero:', r: ['Le doy feedback constructivo en privado', 'Lo corrijo frente a todos', 'Lo ignoro para evitar conflictos'] },
      { p: 'La mejor forma de motivar es:', r: ['Reconociendo el esfuerzo individual', 'Dando órdenes claras', 'Ofreciendo recompensas económicas'] },
    ],
  },
  {
    id: 2, titulo: 'Resolución de Conflictos',
    desc: 'Mide tu enfoque ante problemas laborales.',
    preguntas: [
      { p: 'Un cliente grita, tú:', r: ['Mantengo la calma y escucho', 'Le respondo con firmeza', 'Llamo a un superior inmediatamente'] },
      { p: 'Frente a un imprevisto laboral:', r: ['Adapto mi plan rápidamente', 'Me estreso y me bloqueo', 'Espero instrucciones'] },
      { p: 'Si dos compañeros pelean:', r: ['Medio para que lleguen a un acuerdo', 'Me pongo de un lado', 'Me desentiendo'] },
    ],
  },
  {
    id: 3, titulo: 'Evaluación Social',
    desc: 'Mide tu empatía y habilidad para trabajar en equipo.',
    preguntas: [
      { p: 'Un compañero nuevo parece perdido, tú:', r: ['Me ofrezco a ayudarlo', 'Espero que me pida ayuda', 'Avanzo con mi trabajo'] },
      { p: 'En reuniones grupales:', r: ['Escucho y aporto ideas', 'Dirijo la conversación', 'Prefiero escuchar'] },
      { p: 'Criticas a tu trabajo:', r: ['Las acepto para mejorar', 'Me las tomo personalmente', 'Las ignoro'] },
    ],
  },
  {
    id: 4, titulo: 'Prueba Psicométrica',
    desc: 'Evalúa tu atención al detalle y lógica.',
    preguntas: [
      { p: 'Prefiero tareas que requieran:', r: ['Precisión y detalle', 'Rapidez y movimiento', 'Interacción social'] },
      { p: 'Series de números: 2, 4, 8, ?', r: ['16', '10', '6'] },
      { p: 'Cuando hay mucho ruido trabajando:', r: ['Me concentro igual', 'Me distraigo fácilmente', 'Pongo música para aislarme'] },
    ],
  },
  {
    id: 5, titulo: 'Conocimientos Técnicos',
    desc: 'Evalúa competencias digitales básicas.',
    preguntas: [
      { p: 'Para hacer un informe profesional uso:', r: ['Word/Google Docs', 'Excel/Planillas', 'Power Point'] },
      { p: 'Si la PC no enciende, tú:', r: ['Reviso cables y corriente', 'Llamo a soporte técnico', 'Intento abrirla para ver'] },
      { p: 'Manejo de bases de datos:', r: ['Nivel intermedio/avanzado', 'Sé buscar info básica', 'No uso bases de datos'] },
    ],
  },
  {
    id: 6, titulo: 'Conducta Laboral',
    desc: 'Mide tu ética y responsabilidad en el trabajo.',
    preguntas: [
      { p: 'Llegás tarde al trabajo:', r: ['Aviso en cuanto lo noto', 'Llego y me pongo a trabajar rápido', 'Busco una excusa'] },
      { p: 'Encuentras dinero en la oficina:', r: ['Lo entrego a recursos humanos', 'Lo guardo para mí', 'Pregunto a los compañeros'] },
      { p: 'Tu actitud hacia las reglas es:', r: ['Las respeto siempre', 'Las sigo si tienen sentido', 'Las veo como sugerencias'] },
    ],
  },
];
