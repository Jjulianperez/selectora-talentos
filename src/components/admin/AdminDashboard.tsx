import { useState, useEffect } from 'react';
import { Shield, FileSpreadsheet, RefreshCw, Plus, X, Pencil, Trash2, Briefcase, Save, Newspaper, Upload, FileText, Link, Image } from 'lucide-react';
import { supabase, BUCKET_NAME } from '../../lib/supabase';
import type { Candidate, Vacancy, News, Attachment } from '../../lib/types';
import CandidateTable from './CandidateTable';

interface Props {
  onLogout: () => void;
  onNotification: (msg: string) => void;
}

type Section = 'candidatos' | 'vacantes' | 'novedades';

export default function AdminDashboard({ onLogout, onNotification }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [activeSection, setActiveSection] = useState<Section>('candidatos');

  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [vacForm, setVacForm] = useState({ titulo: '', estado: 'Urgente', descripcion: '', links: '' });
  const [vacAdjuntos, setVacAdjuntos] = useState<Attachment[]>([]);
  const [uploadingVac, setUploadingVac] = useState(false);

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsForm, setNewsForm] = useState({ titulo: '', descripcion: '', url: '' });
  const [newsAdjuntos, setNewsAdjuntos] = useState<Attachment[]>([]);
  const [uploadingNews, setUploadingNews] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsSyncing(true);
    const [candRes, vacRes, newsRes] = await Promise.all([
      supabase.from('candidates').select('*'),
      supabase.from('vacancies').select('*').order('created_at', { ascending: false }),
      supabase.from('news').select('*').order('created_at', { ascending: false }),
    ]);
    if (candRes.data) setCandidates(candRes.data);
    if (vacRes.data) setVacancies(vacRes.data);
    if (newsRes.data) setNewsList(newsRes.data);
    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(false);
  };

  const exportCSV = () => {
    const headers = ["FECHA", "NOMBRE", "DNI", "EMAIL", "SECTOR", "PUESTO", "ÁREAS", "HABILIDADES", "TESTS", "OBS. ADMIN"];
    let csv = "\uFEFF" + headers.join(";") + "\r\n";
    candidates.forEach(c => {
      const row = [
        `"${c.fecha}"`, `"${c.nombre}"`, `"${c.dni || ''}"`, `"${c.email || ''}"`, `"${c.sector || ''}"`, `"${c.puesto || ''}"`,
        `"${(c.areas_exp || []).join(', ')} ${c.areas_exp_otros ? '(' + c.areas_exp_otros + ')' : ''}"`,
        `"${(c.habilidades || []).join(', ')} ${c.habilidades_otros ? '(' + c.habilidades_otros + ')' : ''}"`,
        `"${(c.test_results || []).map((t: any) => t.test + ': ' + t.score).join(' | ')}"`,
        `"${c.observaciones || ''}"`
      ];
      csv += row.join(";") + "\r\n";
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Base_Candidatos_CV_Consultora.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleSaveVacancy = async () => {
    if (!vacForm.titulo.trim()) return;
    const payload = { titulo: vacForm.titulo, estado: vacForm.estado, descripcion: vacForm.descripcion, links: vacForm.links, adjuntos: vacAdjuntos };
    if (editingVacancy) {
      const { error } = await supabase.from('vacancies').update(payload).eq('id', editingVacancy.id);
      if (error) { alert('Error: ' + error.message); return; }
      onNotification(`Vacante actualizada: ${vacForm.titulo}`);
      setEditingVacancy(null);
    } else {
      const { error } = await supabase.from('vacancies').insert({ id: 'VAC-' + Date.now(), ...payload });
      if (error) { alert('Error: ' + error.message); return; }
      onNotification(`Vacante creada: ${vacForm.titulo}`);
    }
    setVacForm({ titulo: '', estado: 'Urgente', descripcion: '', links: '' });
    setVacAdjuntos([]);
    setShowVacancyForm(false);
    loadData();
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('¿Eliminar esta vacante?')) return;
    await supabase.from('vacancies').delete().eq('id', id);
    onNotification('Vacante eliminada');
    loadData();
  };

  const handleVacancyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingVac(true);
    const nuevos: Attachment[] = [];
    for (const f of files) {
      const filePath = `attachments/${Date.now()}_${f.name}`;
      const { data } = await supabase.storage.from(BUCKET_NAME).upload(filePath, f);
      if (data) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
        nuevos.push({ nombre: f.name, tipo: f.type.includes('image') ? 'foto' : f.type.includes('video') ? 'video' : 'documento', url: urlData.publicUrl });
      }
    }
    setVacAdjuntos(prev => [...prev, ...nuevos]);
    setUploadingVac(false);
  };

  const handleNewsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingNews(true);
    const nuevos: Attachment[] = [];
    for (const f of files) {
      const filePath = `attachments/${Date.now()}_${f.name}`;
      const { data } = await supabase.storage.from(BUCKET_NAME).upload(filePath, f);
      if (data) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
        nuevos.push({ nombre: f.name, tipo: f.type.includes('image') ? 'foto' : f.type.includes('video') ? 'video' : 'documento', url: urlData.publicUrl });
      }
    }
    setNewsAdjuntos(prev => [...prev, ...nuevos]);
    setUploadingNews(false);
  };

  const handleSaveNews = async () => {
    if (!newsForm.titulo.trim()) return;
    const payload = { titulo: newsForm.titulo, descripcion: newsForm.descripcion, url: newsForm.url, adjuntos: newsAdjuntos, fecha: new Date().toLocaleDateString('es-AR') };
    if (editingNews) {
      const { error } = await supabase.from('news').update(payload).eq('id', editingNews.id);
      if (error) { alert('Error: ' + error.message); return; }
      onNotification(`Novedad actualizada: ${newsForm.titulo}`);
      setEditingNews(null);
    } else {
      const { error } = await supabase.from('news').insert({ id: 'NEWS-' + Date.now(), ...payload });
      if (error) { alert('Error: ' + error.message); return; }
      onNotification(`Novedad creada: ${newsForm.titulo}`);
    }
    setNewsForm({ titulo: '', descripcion: '', url: '' });
    setNewsAdjuntos([]);
    setShowNewsForm(false);
    loadData();
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('¿Eliminar esta novedad?')) return;
    await supabase.from('news').delete().eq('id', id);
    onNotification('Novedad eliminada');
    loadData();
  };

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'candidatos', label: 'Candidatos', icon: <Shield className="w-4 h-4" /> },
    { id: 'vacantes', label: 'Vacantes', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'novedades', label: 'Novedades', icon: <Newspaper className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#2A2A2A] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#E6CA65] uppercase tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" /> Portal de Administración
          </h2>
          <p className="text-gray-400 mt-1">Gestión de candidatos, vacantes y novedades.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-[#2A2A2A] text-xs shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-200 font-bold">Online</span>
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> : <span className="text-gray-500 text-[10px]">({lastSyncTime})</span>}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#1A1A1A] text-[#E6CA65] border border-[#E6CA65]/40 hover:bg-[#2A2A2A] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"><FileSpreadsheet className="w-4 h-4" /> Exportar</button>
          <button onClick={loadData} className="flex items-center gap-2 bg-[#1A1A1A] text-gray-300 border border-[#2A2A2A] hover:bg-[#2A2A2A] px-4 py-2 rounded-lg text-xs font-semibold"><RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Actualizar</button>
          <button onClick={onLogout} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 rounded-lg text-xs font-bold border border-[#2A2A2A] transition">Cerrar Sesión</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Candidatos</span>
          <p className="text-3xl font-black text-[#E6CA65]">{candidates.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Vacantes</span>
          <p className="text-3xl font-black text-blue-400">{vacancies.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Novedades</span>
          <p className="text-3xl font-black text-emerald-400">{newsList.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Tests en Postulaciones</span>
          <p className="text-3xl font-black text-purple-400">{candidates.filter(c => (c.test_results || []).length > 0).length}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto scrollbar-hide">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap ${activeSection === s.id ? 'text-[#E6CA65] border-b-2 border-[#E6CA65]' : 'text-gray-400 hover:text-gray-200'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'candidatos' && <CandidateTable candidates={candidates} onUpdate={setCandidates} />}

      {activeSection === 'vacantes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-200">Vacantes publicadas</h3>
            <button onClick={() => { setEditingVacancy(null); setVacForm({ titulo: '', estado: 'Urgente', descripcion: '', links: '' }); setVacAdjuntos([]); setShowVacancyForm(true); }} className="flex items-center gap-2 bg-[#E6CA65] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition">
              <Plus className="w-4 h-4" /> Nueva Vacante
            </button>
          </div>
          {showVacancyForm && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#E6CA65]">{editingVacancy ? 'Editar Vacante' : 'Nueva Vacante'}</h4>
                <button onClick={() => { setShowVacancyForm(false); setEditingVacancy(null); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input type="text" placeholder="Título de la vacante" value={vacForm.titulo} onChange={e => setVacForm({ ...vacForm, titulo: e.target.value })} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm" />
              <select value={vacForm.estado} onChange={e => setVacForm({ ...vacForm, estado: e.target.value })} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm">
                <option>Urgente</option><option>Abierta</option><option>Cerrada</option>
              </select>
              <textarea placeholder="Descripción del puesto y requisitos" value={vacForm.descripcion} onChange={e => setVacForm({ ...vacForm, descripcion: e.target.value })} rows={3} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm resize-none" />
              <textarea placeholder="Links de interés (un link por línea: web, formulario, documentación...)" value={vacForm.links} onChange={e => setVacForm({ ...vacForm, links: e.target.value })} rows={2} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm resize-none" />
              <div>
                <label className="form-label">Imágenes y archivos adjuntos</label>
                <div className="flex items-center gap-4 border border-dashed border-[#444] p-4 rounded-lg bg-[#222]">
                  <label className="flex items-center gap-2 bg-[#2D2D2D] border border-[#555] text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#383838] transition text-sm">
                    <Upload className="w-4 h-4" /> Seleccionar
                    <input type="file" multiple onChange={handleVacancyUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                  </label>
                  <span className="text-xs text-gray-500">{vacAdjuntos.length} archivo(s) {uploadingVac && '— subiendo...'}</span>
                </div>
                {vacAdjuntos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {vacAdjuntos.map((adj, i) => (
                      <div key={i} className="relative bg-[#252525] border border-[#333] rounded-lg p-2 text-center group">
                        {adj.tipo === 'foto' ? (
                          <img src={adj.url} alt={adj.nombre} className="w-full h-16 object-cover rounded" />
                        ) : adj.tipo === 'video' ? (
                          <div className="w-full h-16 bg-[#1A1A1A] rounded flex items-center justify-center"><span className="text-xs text-gray-400">Video</span></div>
                        ) : (
                          <FileText className="w-6 h-6 text-[#E6CA65] mx-auto mt-3" />
                        )}
                        <p className="text-[9px] text-gray-500 truncate mt-1">{adj.nombre}</p>
                        <button type="button" onClick={() => setVacAdjuntos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-900/60 text-red-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveVacancy} className="flex items-center gap-2 bg-[#E6CA65] text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition"><Save className="w-4 h-4" /> {editingVacancy ? 'Actualizar' : 'Crear'}</button>
                <button onClick={() => { setShowVacancyForm(false); setEditingVacancy(null); }} className="px-5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white border border-[#333] transition">Cancelar</button>
              </div>
            </div>
          )}
          {vacancies.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center">
              <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay vacantes publicadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vacancies.map(v => (
                <div key={v.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#444] transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-200 truncate">{v.titulo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${v.estado === 'Urgente' ? 'bg-red-500/20 text-red-400' : v.estado === 'Abierta' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{v.estado}</span>
                        {v.descripcion && <span className="ml-2 text-gray-600">{v.descripcion.substring(0, 60)}{v.descripcion.length > 60 ? '...' : ''}</span>}
                        {v.links && <span className="ml-2 text-blue-500"><Link className="w-3 h-3 inline" /> links</span>}
                        {v.adjuntos && v.adjuntos.length > 0 && <span className="ml-2 text-[#E6CA65]"><Image className="w-3 h-3 inline" /> {v.adjuntos.length} archivo(s)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingVacancy(v); setVacForm({ titulo: v.titulo, estado: v.estado, descripcion: v.descripcion, links: v.links || '' }); setVacAdjuntos(v.adjuntos || []); setShowVacancyForm(true); }} className="p-2 text-gray-400 hover:text-[#E6CA65] transition"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteVacancy(v.id)} className="p-2 text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {v.adjuntos && v.adjuntos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {v.adjuntos.filter(a => a.tipo === 'foto').slice(0, 4).map((adj, i) => (
                        <img key={i} src={adj.url} alt={adj.nombre} className="w-16 h-12 object-cover rounded border border-[#333] flex-shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'novedades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-200">Novedades</h3>
            <button onClick={() => { setEditingNews(null); setNewsForm({ titulo: '', descripcion: '', url: '' }); setNewsAdjuntos([]); setShowNewsForm(true); }} className="flex items-center gap-2 bg-[#E6CA65] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition">
              <Plus className="w-4 h-4" /> Nueva Novedad
            </button>
          </div>
          {showNewsForm && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#E6CA65]">{editingNews ? 'Editar Novedad' : 'Nueva Novedad'}</h4>
                <button onClick={() => { setShowNewsForm(false); setEditingNews(null); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input type="text" placeholder="Título de la novedad" value={newsForm.titulo} onChange={e => setNewsForm({ ...newsForm, titulo: e.target.value })} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm" />
              <textarea placeholder="Descripción" value={newsForm.descripcion} onChange={e => setNewsForm({ ...newsForm, descripcion: e.target.value })} rows={3} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm resize-none" />
              <input type="url" placeholder="URL de referencia (opcional)" value={newsForm.url} onChange={e => setNewsForm({ ...newsForm, url: e.target.value })} className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm" />
              <div>
                <label className="form-label">Adjuntar archivos (imágenes, videos, documentos)</label>
                <div className="flex items-center gap-4 border border-dashed border-[#444] p-4 rounded-lg bg-[#222]">
                  <label className="flex items-center gap-2 bg-[#2D2D2D] border border-[#555] text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#383838] transition text-sm">
                    <Upload className="w-4 h-4" /> Seleccionar
                    <input type="file" multiple onChange={handleNewsUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                  </label>
                  <span className="text-xs text-gray-500">{newsAdjuntos.length} archivo(s) {uploadingNews && '— subiendo...'}</span>
                </div>
                {newsAdjuntos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {newsAdjuntos.map((adj, i) => (
                      <div key={i} className="relative bg-[#252525] border border-[#333] rounded-lg p-2 text-center">
                        {adj.tipo === 'foto' && <img src={adj.url} alt={adj.nombre} className="w-full h-16 object-cover rounded" />}
                        {adj.tipo === 'video' && <div className="w-full h-16 bg-[#1A1A1A] rounded flex items-center justify-center"><span className="text-xs text-gray-400">Video</span></div>}
                        {adj.tipo === 'documento' && <FileText className="w-6 h-6 text-[#E6CA65] mx-auto mt-3" />}
                        <p className="text-[9px] text-gray-500 truncate mt-1">{adj.nombre}</p>
                        <button onClick={() => setNewsAdjuntos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveNews} className="flex items-center gap-2 bg-[#E6CA65] text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition"><Save className="w-4 h-4" /> {editingNews ? 'Actualizar' : 'Crear'}</button>
                <button onClick={() => { setShowNewsForm(false); setEditingNews(null); }} className="px-5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white border border-[#333] transition">Cancelar</button>
              </div>
            </div>
          )}
          {newsList.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center">
              <Newspaper className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay novedades publicadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {newsList.map(n => (
                <div key={n.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#444] transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-200 truncate">{n.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.descripcion || 'Sin descripción'}{n.url ? ' — Tiene enlace' : ''}{n.adjuntos?.length ? ` — ${n.adjuntos.length} adjunto(s)` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingNews(n); setNewsForm({ titulo: n.titulo, descripcion: n.descripcion, url: n.url || '' }); setNewsAdjuntos(n.adjuntos || []); setShowNewsForm(true); }} className="p-2 text-gray-400 hover:text-[#E6CA65] transition"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteNews(n.id)} className="p-2 text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
