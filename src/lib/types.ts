export interface TestResult {
  test: string;
  score: string;
  respuestas?: number[];
  interpretacion?: string;
  fecha?: string;
}

export interface Attachment {
  nombre: string;
  tipo: 'foto' | 'video' | 'documento';
  url: string;
}

export interface Candidate {
  id: string;
  fecha: string;
  tipo_postulacion: string;
  vacante_seleccionada: string;
  nombre: string;
  dni: string;
  fecha_nac: string;
  telefono: string;
  email: string;
  localidad: string;
  provincia: string;
  linkedin: string;
  sector: string;
  sector_publico_detalle: string;
  puesto: string;
  buena_conducta: string;
  carnet_manejo: string;
  nivel_educativo: string;
  titulo: string;
  areas_exp: string[];
  areas_exp_otros: string;
  habilidades: string[];
  habilidades_otros: string;
  anios_exp: string;
  ultimo_cargo: string;
  ultima_empresa: string;
  cv: Attachment | null;
  test_results: TestResult[];
  observaciones: string;
}

export interface Vacancy {
  id: string;
  titulo: string;
  estado: string;
  descripcion: string;
  adjuntos: Attachment[];
}

export interface News {
  id: string;
  titulo: string;
  descripcion: string;
  adjuntos: Attachment[];
  url: string;
  fecha: string;
}

export interface Notification {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

export type TabId = 'inicio' | 'postulate' | 'vacantes' | 'novedades';
