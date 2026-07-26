import { useState, useEffect } from 'react';
import { Shield, FileSpreadsheet, RefreshCw, Plus, X, Pencil, Trash2, Briefcase, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Candidate, Vacancy, News } from '../../lib/types';
import CandidateTable from './CandidateTable';

interface Props {
  onLogout: () => void;
  onNotification: (msg: string) => void;
}

export default function AdminDashboard({ onLogout, onNotification }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [activeSection, setActiveSection] = useState<'candidatos' | 'vacantes'>('candidatos');
  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [vacForm, setVacForm] = useState({ titulo: '', estado: 'Urgente', descripcion: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsSyncing(true);
    const [candRes, vacRes, newsRes] = await Promise.all([
      supabase.from('candidates').select('*'),
      supabase.from('vacancies').select('*').order('created_at', { ascending: false }),
      supabase.from('news').select('*'),
    ]);
    if (candRes.data) setCandidates(candRes.data);
    if (vacRes.data) setVacancies(vacRes.data);
    if (newsRes.data) setNews(newsRes.data);
    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(false);
  };

  const exportCSV = () => {
    const headers = ["FECHA", "NOMBRE", "DNI", "EMAIL", "PUESTO", "ÁREAS", "HABILIDADES", "TESTS", "OBS. ADMIN"];
    let csv = "\uFEFF" + headers.join(";") + "\r\n";
    candidates.forEach(c => {
      const row = [
        `"${c.fecha}"`, `"${c.nombre}"`, `"${c.dni || ''}"`, `"${c.email || ''}"`, `"${c.puesto || ''}"`,
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
    if (editingVacancy) {
      const { error } = await supabase.from('vacancies').update({ titulo: vacForm.titulo, estado: vacForm.estado, descripcion: vacForm.descripcion }).eq('id', editingVacancy.id);
      if (!error) {
        onNotification(`Vacante actualizada: ${vacForm.titulo}`);
        setEditingVacancy(null);
      }
    } else {
      const id = 'VAC-' + Date.now();
      const { error } = await supabase.from('vacancies').insert({ id, ...vacForm });
      if (!error) onNotification(`Vacante creada: ${vacForm.titulo}`);
    }
    setVacForm({ titulo: '', estado: 'Urgente', descripcion: '' });
    setShowVacancyForm(false);
    loadData();
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('¿Eliminar esta vacante?')) return;
    await supabase.from('vacancies').delete().eq('id', id);
    onNotification('Vacante eliminada');
    loadData();
  };

  const startEditVacancy = (v: Vacancy) => {
    setEditingVacancy(v);
    setVacForm({ titulo: v.titulo, estado: v.estado, descripcion: v.descripcion });
    setShowVacancyForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#2A2A2A] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#E6CA65] uppercase tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Portal de Administración
          </h2>
          <p className="text-gray-400 mt-1">Gestión avanzada de base de datos, observaciones y reportes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-[#2A2A2A] text-xs shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-200 font-bold">Supabase Activo</span>
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> : <span className="text-gray-500 text-[10px]">({lastSyncTime})</span>}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#1A1A1A] text-[#E6CA65] border border-[#E6CA65]/40 hover:bg-[#2A2A2A] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"><FileSpreadsheet className="w-4 h-4" /> Exportar Excel</button>
          <button onClick={loadData} className="flex items-center gap-2 bg-[#1A1A1A] text-gray-300 border border-[#2A2A2A] hover:bg-[#2A2A2A] px-4 py-2 rounded-lg text-xs font-semibold"><RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Actualizar</button>
          <button onClick={onLogout} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 rounded-lg text-xs font-bold border border-[#2A2A2A] transition">Cerrar Sesión</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Candidatos Totales</span>
          <p className="text-3xl font-black text-[#E6CA65]">{candidates.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Vacantes Activas</span>
          <p className="text-3xl font-black text-blue-400">{vacancies.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Novedades</span>
          <p className="text-3xl font-black text-emerald-400">{news.length}</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Base de Datos</span>
          <p className="text-xs text-emerald-400 font-bold uppercase mt-2">Supabase en línea</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2A2A2A]">
        <button onClick={() => setActiveSection('candidatos')} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${activeSection === 'candidatos' ? 'text-[#E6CA65] border-b-2 border-[#E6CA65]' : 'text-gray-400 hover:text-gray-200'}`}>
          <Shield className="w-4 h-4" /> Candidatos
        </button>
        <button onClick={() => setActiveSection('vacantes')} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${activeSection === 'vacantes' ? 'text-[#E6CA65] border-b-2 border-[#E6CA65]' : 'text-gray-400 hover:text-gray-200'}`}>
          <Briefcase className="w-4 h-4" /> Vacantes
        </button>
      </div>

      {activeSection === 'candidatos' && (
        <CandidateTable candidates={candidates} onUpdate={setCandidates} />
      )}

      {activeSection === 'vacantes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-200">Vacantes publicadas</h3>
            <button onClick={() => { setEditingVacancy(null); setVacForm({ titulo: '', estado: 'Urgente', descripcion: '' }); setShowVacancyForm(true); }}
              className="flex items-center gap-2 bg-[#E6CA65] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition">
              <Plus className="w-4 h-4" /> Nueva Vacante
            </button>
          </div>

          {showVacancyForm && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#E6CA65]">{editingVacancy ? 'Editar Vacante' : 'Nueva Vacante'}</h4>
                <button onClick={() => { setShowVacancyForm(false); setEditingVacancy(null); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input type="text" placeholder="Título de la vacante" value={vacForm.titulo} onChange={e => setVacForm({ ...vacForm, titulo: e.target.value })}
                className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm" />
              <select value={vacForm.estado} onChange={e => setVacForm({ ...vacForm, estado: e.target.value })}
                className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm">
                <option>Urgente</option><option>Abierta</option><option>Cerrada</option>
              </select>
              <textarea placeholder="Descripción (opcional)" value={vacForm.descripcion} onChange={e => setVacForm({ ...vacForm, descripcion: e.target.value })} rows={3}
                className="w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-sm resize-none" />
              <div className="flex gap-3">
                <button onClick={handleSaveVacancy} className="flex items-center gap-2 bg-[#E6CA65] text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#d8bd58] transition">
                  <Save className="w-4 h-4" /> {editingVacancy ? 'Actualizar' : 'Crear'}
                </button>
                <button onClick={() => { setShowVacancyForm(false); setEditingVacancy(null); }} className="px-5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white border border-[#333] transition">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {vacancies.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center">
              <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay vacantes publicadas.</p>
              <p className="text-gray-500 text-xs mt-1">Creá una para que los postulantes puedan aplicar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vacancies.map(v => (
                <div key={v.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#444] transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-200 truncate">{v.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.estado === 'Urgente' ? 'bg-red-500/20 text-red-400' : v.estado === 'Abierta' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{v.estado}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEditVacancy(v)} className="p-2 text-gray-400 hover:text-[#E6CA65] transition"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteVacancy(v.id)} className="p-2 text-gray-400 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
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
