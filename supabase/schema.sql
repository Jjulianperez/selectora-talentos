-- ============================================
-- CV Consultora - Supabase Schema v2
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================

-- Tabla de candidatos (actualizada con nuevos campos)
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL DEFAULT '',
  tipo_postulacion TEXT DEFAULT 'espontanea',
  vacante_seleccionada TEXT DEFAULT '',
  nombre TEXT NOT NULL,
  dni TEXT DEFAULT '',
  fecha_nac TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  email TEXT DEFAULT '',
  localidad TEXT DEFAULT '',
  provincia TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  puesto TEXT DEFAULT '',
  buena_conducta TEXT DEFAULT 'No',
  carnet_manejo TEXT DEFAULT 'No posee',
  nivel_educativo TEXT DEFAULT '',
  titulo TEXT DEFAULT '',
  areas_exp TEXT[] DEFAULT '{}',
  areas_exp_otros TEXT DEFAULT '',
  habilidades TEXT[] DEFAULT '{}',
  habilidades_otros TEXT DEFAULT '',
  anios_exp TEXT DEFAULT '',
  ultimo_cargo TEXT DEFAULT '',
  ultima_empresa TEXT DEFAULT '',
  cv JSONB DEFAULT NULL,
  test_results JSONB DEFAULT '[]'::jsonb,
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de vacantes (actualizada con adjuntos)
CREATE TABLE IF NOT EXISTS vacancies (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  estado TEXT DEFAULT 'Urgente',
  descripcion TEXT DEFAULT '',
  adjuntos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de novedades (actualizada con adjuntos)
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  adjuntos JSONB DEFAULT '[]'::jsonb,
  url TEXT DEFAULT '',
  fecha TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket para archivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('cvs', 'attachments'));

CREATE POLICY "Allow anyone to upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('cvs', 'attachments'));

CREATE POLICY "Allow delete"
ON storage.objects FOR DELETE
USING (bucket_id IN ('cvs', 'attachments'));
