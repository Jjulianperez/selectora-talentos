import { useState } from 'react';
import { areasATS, habilidadesATS } from '../../data/areas';
import { supabase, BUCKET_NAME } from '../../lib/supabase';
import type { TabId, Attachment } from '../../lib/types';

interface Props {
  onNavigate: (tab: TabId) => void;
  onPostulation: (msg: string) => void;
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
  localidad: '', provincia: '', linkedin: '', puesto: '',
  buenaConducta: 'No', carnetManejo: 'No posee',
  nivelEducativo: '', titulo: '', areasExp: [], areasExpOtros: '',
  habilidades: [], habilidadesOtros: '', aniosExp: '', ultimoCargo: '',
  ultimaEmpresa: '', cv: null,
};

const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1";

export default function Postulate({ onNavigate, onPostulation }: Props) {
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleArray = (field: 'areasExp' | 'habilidades', value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) return alert('Por favor, completa tu Nombre y Apellido.');
    if (form.areasExp.length === 0) return alert('Debes seleccionar al menos un Área de Experiencia.');
    if (form.habilidades.length === 0) return alert('Debes seleccionar al menos una Habilidad.');

    setUploading(true);

    let cvData = form.cv;
    if (form.cv && form.cv.url.startsWith('blob:')) {
      const fileExt = form.cv.nombre.split('.').pop();
      const filePath = `cvs/${Date.now()}_${form.nombre.replace(/\s+/g, '_')}.${fileExt}`;
      const response = await fetch(form.cv.url);
      const blob = await response.blob();
      const { data: uploadData } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);
        cvData = { nombre: form.cv.nombre, tipo: 'documento', url: urlData.publicUrl };
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
      provincia: form.provincia, linkedin: form.linkedin, puesto: puestoFinal,
      buena_conducta: form.buenaConducta, carnet_manejo: form.carnetManejo,
      nivel_educativo: form.nivelEducativo, titulo: form.titulo,
      areas_exp: form.areasExp, areas_exp_otros: form.areasExpOtros,
      habilidades: form.habilidades, habilidades_otros: form.habilidadesOtros,
      anios_exp: form.aniosExp, ultimo_cargo: form.ultimoCargo,
      ultima_empresa: form.ultimaEmpresa, cv: cvData,
      test_results: [], observaciones: '',
    };

    const { error } = await supabase.from('candidates').insert(candidate);
    if (error) console.error('Error:', error);

    setUploading(false);
    setSubmitted(true);
    onPostulation(`Nueva postulación: ${form.nombre} para ${puestoFinal}`);
    setForm(emptyForm);
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
    <div className="w-full bg-[#1A1A1A] p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#E6CA65] mb-2">Postulate</h2>
      <p className="text-sm text-gray-400 mb-8">
        Puedes postularte de manera <strong className="text-[#F2D2A0]">espontánea para nuestra base de datos</strong> o aplicar a un puesto específico. ¡Te permitimos postularte la cantidad de veces que necesites!
      </p>

      {submitted ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-[#1A1A1A] border border-[#E6CA65]/40 rounded-xl w-full max-w-md p-8 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#E6CA65]/10 flex items-center justify-center text-[#E6CA65] text-5xl border border-[#E6CA65]/30">✓</div>
            <div className="space-y-2">
              <p className="text-gray-200 text-lg font-light">gracias por sumarte a nuestro equipo, pronto nos pondremos en contacto</p>
              <h3 className="text-2xl font-bold text-[#E6CA65] tracking-wide">CV Consultora</h3>
            </div>
            <button onClick={() => setSubmitted(false)} className="mt-4 bg-[#E6CA65] text-black font-bold py-2 px-8 rounded-lg hover:bg-[#d8bd58] transition text-sm">Cerrar</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="form-section">
            <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Tipo de Postulación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="button" onClick={() => setForm({ ...form, tipoPostulacion: 'espontanea' })}
                className={`p-4 rounded-lg border-2 transition text-center ${form.tipoPostulacion === 'espontanea' ? 'border-[#E6CA65] bg-[#252525]' : 'border-[#444] hover:border-[#666]'}`}>
                <span className="block font-bold text-[#F2D2A0]">Postulación Espontánea</span>
                <span className="text-xs text-gray-400 mt-1 block">Quiero sumar mi CV a la base de datos</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, tipoPostulacion: 'puesto' })}
                className={`p-4 rounded-lg border-2 transition text-center ${form.tipoPostulacion === 'puesto' ? 'border-[#E6CA65] bg-[#252525]' : 'border-[#444] hover:border-[#666]'}`}>
                <span className="block font-bold text-[#F2D2A0]">Puesto Específico</span>
                <span className="text-xs text-gray-400 mt-1 block">Aplicar a una vacante publicada</span>
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="form-label">Nombre y Apellido *</label><input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={inputClass} /></div>
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
            <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <div><label className="form-label">Última Empresa</label><input type="text" value={form.ultimaEmpresa} onChange={e => setForm({ ...form, ultimaEmpresa: e.target.value })} className={inputClass} /></div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Filtros ATS (Selección múltiple)</h3>
            <div className="mb-6">
              <label className="form-label">Áreas de Experiencia *</label>
              <CheckboxPills options={areasATS} field="areasExp" />
              {form.areasExp.includes('Otros') && (
                <input type="text" placeholder="Especificar área..." value={form.areasExpOtros} onChange={e => setForm({ ...form, areasExpOtros: e.target.value })} className={inputClass + ' mt-2'} />
              )}
            </div>
            <div>
              <label className="form-label">Habilidades Destacadas *</label>
              <CheckboxPills options={habilidadesATS} field="habilidades" />
              {form.habilidades.includes('Otros') && (
                <input type="text" placeholder="Especificar habilidad..." value={form.habilidadesOtros} onChange={e => setForm({ ...form, habilidadesOtros: e.target.value })} className={inputClass + ' mt-2'} />
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="text-lg font-semibold text-[#F2D2A0] mb-4">Adjuntar CV</h3>
            <div className="bg-[#222] p-4 rounded-lg border border-dashed border-[#444]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-sm text-gray-300">📎 Adjuntar CV (PDF, Word)</span>
                <span className="text-xs text-[#E6CA65]">{form.cv ? form.cv.nombre : 'Seleccionar archivo'}</span>
                <input type="file" onChange={handleCvUpload} accept=".pdf,.doc,.docx" className="hidden" />
              </label>
            </div>
          </div>

          <button type="submit" disabled={uploading}
            className="w-full bg-[#E6CA65] text-black font-bold py-4 rounded-lg hover:bg-[#d8bd58] transition text-lg disabled:opacity-50">
            {uploading ? 'Enviando...' : 'Enviar Postulación'}
          </button>
        </form>
      )}
    </div>
  );
}
