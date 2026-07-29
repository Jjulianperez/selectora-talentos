import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Paperclip, AlertCircle, Brain } from 'lucide-react';
import { areasATS, habilidadesATS } from '../../data/areas';
import { testModules } from '../../data/tests';
import { supabase, BUCKET_NAME } from '../../lib/supabase';
import Modal from '../ui/Modal';
import TestRunner from './TestRunner';
import type { TabId, Attachment, TestResult } from '../../lib/types';

interface Props {
  onNavigate: (tab: TabId) => void;
  onPostulation: (msg: string) => void;
  preselectVacancy?: string | null;
  onVacancyConsumed?: () => void;
}

interface PostForm {
  tipoPostulacion: string;
  vacanteSeleccionada: string;
  nombre: string;
  dni: string;
  fechaNac: string;
  telefono: string;
  email: string;
  localidad: string;
  provincia: string;
  linkedin: string;
  sector: string;
  sectorPublicoDetalle: string;
  puesto: string;
  buenaConducta: string;
  carnetManejo: string;
  nivelEducativo: string;
  titulo: string;
  areasExp: string[];
  areasExpOtros: string;
  habilidades: string[];
  habilidadesOtros: string;
  aniosExp: string;
  ultimoCargo: string;
  ultimaEmpresa: string;
  cv: Attachment | null;
}

const emptyForm: PostForm = {
  tipoPostulacion: 'espontanea', vacanteSeleccionada: '',
  nombre: '', dni: '', fechaNac: '', telefono: '', email: '',
  localidad: '', provincia: '', linkedin: '', sector: '', sectorPublicoDetalle: '', puesto: '',
  buenaConducta: 'No', carnetManejo: 'No posee',
  nivelEducativo: '', titulo: '', areasExp: [], areasExpOtros: '',
  habilidades: [], habilidadesOtros: '', aniosExp: '', ultimoCargo: '',
  ultimaEmpresa: '', cv: null,
};

const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1 transition-colors duration-200";

export default function Postulate({ onNavigate, onPostulation, preselectVacancy, onVacancyConsumed }: Props) {
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [vacancies, setVacancies] = useState<{ id: string; titulo: string }[]>([]);
  const [testResults, setTestResults] = useState<(TestResult & { respuestas: number[]; interpretacion: string; fecha: string })[]>([]);
  const testResultsRef = useRef<(TestResult & { respuestas: number[]; interpretacion: string; fecha: string })[]>([]);
  const [showTests, setShowTests] = useState(false);

  useEffect(() => {
    supabase.from('vacancies').select('id, titulo').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setVacancies(data);
    });
  }, []);

  useEffect(() => {
    if (preselectVacancy) {
      setForm(prev => ({
        ...prev,
        tipoPostulacion: 'puesto',
        vacanteSeleccionada: preselectVacancy,
        puesto: preselectVacancy,
      }));
      onVacancyConsumed?.();
    }
  }, [preselectVacancy, onVacancyConsumed]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (form.areasExp.length === 0) e.areasExp = 'Seleccioná al menos un área';
    if (form.habilidades.length === 0) e.habilidades = 'Seleccioná al menos una habilidad';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleArray = (field: 'areasExp' | 'habilidades', value: string) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    setForm(prev => {
      const arr = prev[field];
      const isActive = arr.includes(value);
      const newArr = isActive ? arr.filter(v => v !== value) : [...arr, value];
      if (isActive && value === 'Otros') return { ...prev, [field]: newArr, [field === 'areasExp' ? 'areasExpOtros' : 'habilidadesOtros']: '' };
      return { ...prev, [field]: newArr };
    });
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm(prev => ({ ...prev, cv: { nombre: file.name, tipo: 'documento', url: URL.createObjectURL(file) } }));
  };

  const doSubmit = async () => {
    if (!validate()) return;

    const testResultsParaEnviar = testResultsRef.current;

    setUploading(true);
    setSubmitError('');

    let cvData = form.cv;
    if (form.cv && form.cv.url.startsWith('blob:')) {
      try {
        const fileExt = form.cv.nombre.split('.').pop();
        const filePath = `cvs/${Date.now()}_${form.nombre.replace(/\s+/g, '_')}.${fileExt}`;
        const response = await fetch(form.cv.url);
        const blob = await response.blob();
        const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob);
        if (uploadError) {
          console.error('Error subiendo CV:', uploadError);
          setSubmitError('Error al subir el CV. Intentá nuevamente.');
          setUploading(false);
          return;
        }
        if (uploadData) {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);
          cvData = { nombre: form.cv.nombre, tipo: 'documento', url: urlData.publicUrl };
        }
      } catch (err) {
        console.error('Error procesando CV:', err);
        setSubmitError('Error al procesar el archivo del CV. Intentá con otro archivo.');
        setUploading(false);
        return;
      }
    }

    let puestoFinal = form.tipoPostulacion === 'espontanea' ? 'Postulación Espontánea' : (form.vacanteSeleccionada || 'Puesto Específico');
    if (form.puesto) puestoFinal = form.puesto;

    const candidate = {
      id: 'CND-' + Date.now(),
      fecha: new Date().toLocaleString('es-AR'),
      tipo_postulacion: form.tipoPostulacion,
      vacante_seleccionada: form.vacanteSeleccionada,
      nombre: form.nombre, dni: form.dni, fecha_nac: form.fechaNac,
      telefono: form.telefono, email: form.email, localidad: form.localidad,
      provincia: form.provincia, linkedin: form.linkedin, sector: form.sector, sector_publico_detalle: form.sector === 'Público' ? form.sectorPublicoDetalle : '', puesto: puestoFinal,
      buena_conducta: form.buenaConducta, carnet_manejo: form.carnetManejo,
      nivel_educativo: form.nivelEducativo, titulo: form.titulo,
      areas_exp: form.areasExp, areas_exp_otros: form.areasExpOtros,
      habilidades: form.habilidades, habilidades_otros: form.habilidadesOtros,
      anios_exp: form.aniosExp, ultimo_cargo: form.ultimoCargo,
      ultima_empresa: form.ultimaEmpresa, cv: cvData,
        test_results: testResultsParaEnviar,
        observaciones: '',
    };

    const { error } = await supabase.from('candidates').insert(candidate);
    if (error) {
      console.error('Error guardando postulación:', error);
      setSubmitError('Error al guardar la postulación. Verificá tus datos e intentá nuevamente.');
      setUploading(false);
      return;
    }

    setUploading(false);
    setSubmitted(true);
    onPostulation(`Nueva postulación: ${form.nombre} para ${puestoFinal}`);
    setForm(emptyForm);
    setTestResults([]);
    setShowTests(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmit();
  };

  const CheckboxPills = ({ options, field }: { options: string[]; field: 'areasExp' | 'habilidades' }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => (
        <button type="button" key={opt} onClick={() => toggleArray(field, opt)}
          className={`px-3 py-1.5 text-xs rounded-full border transition checkbox-pill ${form[field].includes(opt) ? 'active' : 'bg-[#252525] border-[#444] text-gray-300 hover:bg-[#333]'}`}>
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-[#1A1A1A] p-4 sm:p-6 rounded-xl border border-[#2A2A2A]">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#E6CA65] mb-2">Postulate</h2>
      <p className="text-sm text-gray-400 mb-8">
        Puedes postularte de manera <strong className="text-[#F2D2A0]">espontánea para nuestra base de datos</strong> o aplicar a un puesto específico. ¡Te permitimos postularte la cantidad de veces que necesites!
      </p>

      <Modal open={submitted} onClose={() => setSubmitted(false)} size="md">
        <div className="py-12 px-8 text-center flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-[#E6CA65]/10 flex items-center justify-center border-2 border-[#E6CA65]/20">
            <CheckCircle className="w-12 h-12 text-[#E6CA65]" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-100 text-xl font-light leading-relaxed">¡Gracias por sumarte a nuestro equipo!</p>
            <p className="text-gray-400 text-sm">Pronto nos pondremos en contacto.</p>
            <h3 className="text-2xl font-bold text-[#E6CA65] tracking-wide mt-3">CV Consultora</h3>
          </div>
          <button onClick={() => setSubmitted(false)} className="mt-3 bg-[#E6CA65] text-black font-bold py-3 px-10 rounded-lg hover:bg-[#d8bd58] transition text-sm">Cerrar</button>
        </div>
      </Modal>

      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="form-section">
            <div className="form-step" data-step="1">
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Tipo de Postulación</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <button type="button" onClick={() => setForm({ ...form, tipoPostulacion: 'espontanea' })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${form.tipoPostulacion === 'espontanea' ? 'border-[#E6CA65] bg-[#E6CA65]/5 shadow-md shadow-[#E6CA65]/5' : 'border-[#444] hover:border-[#666]'}`}>
                <span className="block font-bold text-[#F2D2A0]">Postulación Espontánea</span>
                <span className="text-xs text-gray-400 mt-1 block">Quiero sumar mi CV a la base de datos</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, tipoPostulacion: 'puesto' })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${form.tipoPostulacion === 'puesto' ? 'border-[#E6CA65] bg-[#E6CA65]/5 shadow-md shadow-[#E6CA65]/5' : 'border-[#444] hover:border-[#666]'}`}>
                <span className="block font-bold text-[#F2D2A0]">Puesto Específico</span>
                <span className="text-xs text-gray-400 mt-1 block">Aplicar a una vacante publicada</span>
              </button>
            </div>
          </div>

          {form.tipoPostulacion === 'puesto' && (
            <div className="form-section animate-fade-up">
              <div className="form-step" data-step="2">
                <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Seleccionar Vacante</h3>
              </div>
              <div className="mt-4">
                <select
                  value={form.vacanteSeleccionada}
                  onChange={e => setForm({ ...form, vacanteSeleccionada: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Elegí una vacante...</option>
                  {vacancies.map(v => (
                    <option key={v.id} value={v.titulo}>{v.titulo}</option>
                  ))}
                </select>
                {vacancies.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No hay vacantes disponibles en este momento.</p>
                )}
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="form-step" data-step={form.tipoPostulacion === 'puesto' ? '3' : '2'}>
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className={errors.nombre ? 'field-error' : ''}>
                <label className="form-label">Nombre y Apellido *</label>
                <input type="text" value={form.nombre} onChange={e => { setForm({ ...form, nombre: e.target.value }); if (errors.nombre) setErrors(p => { const n = { ...p }; delete n.nombre; return n; }); }} className={inputClass} />
                {errors.nombre && <p className="field-error-msg flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nombre}</p>}
              </div>
              <div><label className="form-label">DNI</label><input type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Fecha de Nacimiento</label><input type="date" value={form.fechaNac} onChange={e => setForm({ ...form, fechaNac: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Teléfono</label><input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Localidad</label><input type="text" value={form.localidad} onChange={e => setForm({ ...form, localidad: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Provincia</label><input type="text" value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">LinkedIn (Opcional)</label><input type="text" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} className={inputClass} /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-step" data-step={form.tipoPostulacion === 'puesto' ? '4' : '3'}>
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Información Profesional</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
              <div><label className="form-label">Puesto al que se postula (Opcional)</label><input type="text" placeholder="Ej: Administrativo" value={form.puesto} onChange={e => setForm({ ...form, puesto: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Años de Experiencia</label><input type="number" value={form.aniosExp} onChange={e => setForm({ ...form, aniosExp: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Certificado de Buena Conducta</label>
                <select value={form.buenaConducta} onChange={e => setForm({ ...form, buenaConducta: e.target.value })} className={inputClass}>
                  <option>No</option><option>Sí, al día</option><option>En trámite</option>
                </select>
              </div>
              <div><label className="form-label">Carnet de Conducir</label>
                <select value={form.carnetManejo} onChange={e => setForm({ ...form, carnetManejo: e.target.value })} className={inputClass}>
                  <option>No posee</option><option>Auto (B1)</option><option>Moto (A2)</option><option>Profesional (C/D)</option>
                </select>
              </div>
              <div><label className="form-label">Nivel Educativo</label>
                <select value={form.nivelEducativo} onChange={e => setForm({ ...form, nivelEducativo: e.target.value })} className={inputClass}>
                  <option value="">Seleccionar...</option><option>Secundario Incompleto</option><option>Secundario Completo</option>
                  <option>Terciario Incompleto</option><option>Terciario Completo</option>
                  <option>Universitario Incompleto</option><option>Universitario Completo</option>
                </select>
              </div>
              <div><label className="form-label">Título o Especialidad</label><input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className={inputClass} /></div>
              <div><label className="form-label">Cargo en último empleo</label><input type="text" value={form.ultimoCargo} onChange={e => setForm({ ...form, ultimoCargo: e.target.value })} className={inputClass} /></div>
              <div>
                <label className="form-label">Sector</label>
                <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value, sectorPublicoDetalle: e.target.value !== 'Público' ? '' : form.sectorPublicoDetalle })} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  <option value="Público">Público</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>
              {form.sector === 'Público' && (
                <div>
                  <label className="form-label">Especificá el sector público</label>
                  <input type="text" value={form.sectorPublicoDetalle} onChange={e => setForm({ ...form, sectorPublicoDetalle: e.target.value })} className={inputClass} placeholder="Ej: Municipalidad, Hospital, Escuela..." />
                </div>
              )}
              <div><label className="form-label">Última Empresa</label><input type="text" value={form.ultimaEmpresa} onChange={e => setForm({ ...form, ultimaEmpresa: e.target.value })} className={inputClass} /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-step" data-step={form.tipoPostulacion === 'puesto' ? '5' : '4'}>
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Filtros ATS (Selección múltiple)</h3>
            </div>
            <div className="mb-6 mt-4">
              <label className="form-label">Áreas de Experiencia *</label>
              <CheckboxPills options={areasATS} field="areasExp" />
              {errors.areasExp && <p className="field-error-msg flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.areasExp}</p>}
              {form.areasExp.includes('Otros') && (
                <input type="text" placeholder="Especificar área..." value={form.areasExpOtros} onChange={e => setForm({ ...form, areasExpOtros: e.target.value })} className={inputClass + ' mt-2'} />
              )}
            </div>
            <div>
              <label className="form-label">Habilidades Destacadas *</label>
              <CheckboxPills options={habilidadesATS} field="habilidades" />
              {errors.habilidades && <p className="field-error-msg flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.habilidades}</p>}
              {form.habilidades.includes('Otros') && (
                <input type="text" placeholder="Especificar habilidad..." value={form.habilidadesOtros} onChange={e => setForm({ ...form, habilidadesOtros: e.target.value })} className={inputClass + ' mt-2'} />
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-step" data-step={form.tipoPostulacion === 'puesto' ? '6' : '5'}>
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Adjuntar CV</h3>
            </div>
            <div className="mt-4 bg-[#222] p-4 rounded-lg border border-dashed border-[#444] hover:border-[#666] transition-colors">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-sm text-gray-300"><Paperclip className="w-4 h-4" /> Adjuntar CV (PDF, Word)</span>
                <span className="text-xs text-[#E6CA65]">{form.cv ? form.cv.nombre : 'Seleccionar archivo'}</span>
                <input type="file" onChange={handleCvUpload} accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            </div>
          </div>

          {/* Evaluaciones Psicotécnicas */}
          <div className="form-section">
            <div className="form-step" data-step={form.tipoPostulacion === 'puesto' ? '7' : '6'}>
              <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Evaluaciones Psicotécnicas (Opcional)</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Podés completar nuestras evaluaciones antes de enviar tu postulación. Esto permitirá a la consultora conocer mejor tu perfil.
            </p>

            {!showTests && testResults.length === 0 && (
              <button type="button" onClick={() => setShowTests(true)}
                className="w-full bg-[#E6CA65] text-black font-bold py-3 px-5 rounded-lg hover:bg-[#d8bd58] transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-[#E6CA65]/10">
                <Brain className="w-4 h-4" /> Completar tests para la postulación
              </button>
            )}

            {showTests && (
              <div className="mt-2 animate-fade-up">
                <TestRunner
                  existingResults={testResults}
                  onComplete={(results) => {
                    testResultsRef.current = results;
                    setTestResults(results);
                    setShowTests(false);
                  }}
                  onBack={() => setShowTests(false)}
                />
              </div>
            )}

            {testResults.length > 0 && !showTests && (
              <div className="mt-2 bg-emerald-900/10 border border-emerald-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold text-sm">Tests completados ({testResults.length}/{testModules.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {testResults.map((tr, i) => (
                    <span key={i} className="text-xs bg-[#252525] border border-emerald-800/40 text-emerald-300 px-2 py-1 rounded">
                      {tr.test}: {tr.score}
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => setShowTests(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline">
                  Revisar o completar más tests
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {!showTests && (
            <button type="submit" disabled={uploading}
              className="w-full bg-[#E6CA65] text-black font-bold py-4 rounded-lg hover:bg-[#d8bd58] transition-all duration-200 text-lg disabled:opacity-50 shadow-lg shadow-[#E6CA65]/10 hover:shadow-[#E6CA65]/20">
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Enviando...
                </span>
              ) : 'Enviar Postulación'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
