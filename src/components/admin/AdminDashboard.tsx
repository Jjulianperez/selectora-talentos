import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsSyncing(true);
    const [candRes, vacRes, newsRes] = await Promise.all([
      supabase.from('candidates').select('*'),
      supabase.from('vacancies').select('*'),
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

  return (
    <div className="space-y-8">
      <div className="border-b border-[#2A2A2A] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#E6CA65] uppercase tracking-tight flex items-center gap-2">
            <span className="text-3xl">🔒</span>
            Portal de Administración
          </h2>
          <p className="text-gray-400 mt-1">Gestión avanzada de base de datos, observaciones y reportes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-[#2A2A2A] text-xs shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-200 font-bold">Supabase Activo</span>
            {isSyncing ? (
              <span className="text-emerald-400 animate-spin">⟳</span>
            ) : (
              <span className="text-gray-500 text-[10px]">({lastSyncTime})</span>
            )}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#1A1A1A] text-[#E6CA65] border border-[#E6CA65]/40 hover:bg-[#2A2A2A] px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">📊 Exportar Excel</button>
          <button onClick={onLogout} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 rounded-lg text-xs font-bold border border-[#2A2A2A] transition">
            Cerrar Sesión
          </button>
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

      <CandidateTable candidates={candidates} onUpdate={setCandidates} />
    </div>
  );
}
