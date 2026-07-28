-- ============================================
-- CV Consultora - Supabase Schema v5
-- Ejecutar esto en el SQL Editor de Supabase
-- IMPORTANTE: Si ya ejecutaste la versión anterior,
-- primero ejecuta el bloque "DROP" que está al final.
--
-- CAMBIOS v5:
-- - Los tests ya no son una página independiente.
-- - Son un paso opcional dentro del formulario de postulación.
-- - Los resultados se guardan en test_results (JSONB) de candidates.
-- - La tabla test_scores se mantiene solo para datos históricos.
-- - Se agregó columna tests_realizados a candidates.
-- ============================================

-- ============================================
-- BLOQUE 1: Limpiar versiones anteriores (si existen)
-- ============================================

-- Limpiar TODAS las políticas de storage.objects
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
  END LOOP;
END $$;

-- Limpiar TODAS las políticas de candidates
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'candidates') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON candidates';
  END LOOP;
END $$;

-- Limpiar TODAS las políticas de vacancies
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'vacancies') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON vacancies';
  END LOOP;
END $$;

-- Limpiar TODAS las políticas de news
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'news') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON news';
  END LOOP;
END $$;

-- Limpiar funciones y tablas anteriores
DROP FUNCTION IF EXISTS update_test_results(text, jsonb);
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS vacancies CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS test_scores CASCADE;

-- ============================================
-- BLOQUE 2: Tablas
-- ============================================

CREATE TABLE candidates (
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
  sector TEXT DEFAULT '',
  sector_publico_detalle TEXT DEFAULT '',
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

CREATE TABLE vacancies (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  estado TEXT DEFAULT 'Urgente',
  descripcion TEXT DEFAULT '',
  adjuntos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  adjuntos JSONB DEFAULT '[]'::jsonb,
  url TEXT DEFAULT '',
  fecha TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- test_scores removida en v5 — los resultados se guardan en candidates.test_results

-- ============================================
-- BLOQUE 3: RPC Functions
-- ============================================

-- Función atómica para actualizar test_results de un candidato por email
CREATE OR REPLACE FUNCTION update_test_results(p_email TEXT, p_result JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  v_found BOOLEAN;
BEGIN
  UPDATE candidates
  SET test_results = test_results || jsonb_build_array(p_result)
  WHERE email = p_email;
  GET DIAGNOSTICS v_found = ROW_COUNT;
  RETURN v_found > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BLOQUE 4: RLS (Row Level Security)
-- ============================================

-- Permisos base de tabla
GRANT INSERT ON candidates TO anon;
GRANT SELECT ON vacancies TO anon;
GRANT SELECT ON news TO anon;
GRANT ALL ON candidates TO authenticated;
GRANT ALL ON vacancies TO authenticated;
GRANT ALL ON news TO authenticated;

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- CANDIDATES:
-- anon (público): solo INSERT (formularios de postulación)
CREATE POLICY "candidates_insert_public"
  ON candidates FOR INSERT
  TO anon
  WITH CHECK (true);

-- authenticated (admin): SELECT, UPDATE, DELETE completo
CREATE POLICY "candidates_select_auth"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "candidates_update_auth"
  ON candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "candidates_delete_auth"
  ON candidates FOR DELETE
  TO authenticated
  USING (true);

-- (anon NO tiene SELECT ni UPDATE en candidates — datos protegidos)

-- VACANCIES:
-- anon (público): solo SELECT (ver vacantes publicadas)
CREATE POLICY "vacancies_select_public"
  ON vacancies FOR SELECT
  TO anon
  USING (true);

-- authenticated (admin): INSERT, UPDATE, DELETE
CREATE POLICY "vacancies_insert_auth"
  ON vacancies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "vacancies_update_auth"
  ON vacancies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "vacancies_delete_auth"
  ON vacancies FOR DELETE
  TO authenticated
  USING (true);

-- authenticated (admin): SELECT completo
CREATE POLICY "vacancies_select_auth"
  ON vacancies FOR SELECT
  TO authenticated
  USING (true);

-- NEWS:
-- anon (público): solo SELECT (ver novedades)
CREATE POLICY "news_select_public"
  ON news FOR SELECT
  TO anon
  USING (true);

-- authenticated (admin): INSERT, UPDATE, DELETE
CREATE POLICY "news_insert_auth"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "news_update_auth"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "news_delete_auth"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- authenticated (admin): SELECT completo
CREATE POLICY "news_select_auth"
  ON news FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- BLOQUE 5: Storage
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de archivos
CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('cvs', 'attachments'));

-- Anyone can upload (formularios públicos + admin)
CREATE POLICY "storage_insert_public"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('cvs', 'attachments'));

-- Solo authenticated puede borrar archivos
CREATE POLICY "storage_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('cvs', 'attachments'));
