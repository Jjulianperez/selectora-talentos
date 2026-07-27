import { useState, useRef, useCallback } from 'react';
import { Search, FileSpreadsheet, Eye, FileText, Trash2, X, Download, Brain, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import type { Candidate } from '../../lib/types';

interface Props {
  candidates: Candidate[];
  onUpdate: (candidates: Candidate[]) => void;
}

export default function CandidateTable({ candidates, onUpdate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [perfilParaVer, setPerfilParaVer] = useState<Candidate | null>(null);
  const [cvParaVer, setCvParaVer] = useState<Candidate | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1";

  const candidatosFiltrados = candidates.filter((c: Candidate) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || c.dni?.includes(q) || c.puesto?.toLowerCase().includes(q) || c.sector?.toLowerCase().includes(q) || (c.areas_exp || []).join(' ').toLowerCase().includes(q);
  });

  const actualizarObservacion = useCallback((id: string, texto: string) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      setSavingId(id);
      await supabase.from('candidates').update({ observaciones: texto }).eq('id', id);
      onUpdate(candidates.map(c => c.id === id ? { ...c, observaciones: texto } : c));
      setSavingId(null);
    }, 800);
  }, [candidates, onUpdate]);

  const eliminarCandidato = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este candidato?')) return;
    await supabase.from('candidates').delete().eq('id', id);
    onUpdate(candidates.filter(c => c.id !== id));
  };

  const exportCSV = () => {
    const headers = ["FECHA", "NOMBRE", "DNI", "NAC.", "TELÉFONO", "EMAIL", "LOC", "PROV", "LINKEDIN", "SECTOR", "PUESTO", "CONDUCTA", "CARNET", "EDU.", "TITULO", "AREAS", "HABILIDADES", "EXP", "CARGO", "EMPRESA", "TESTS", "OBS. ADMIN"];
    let csv = "\uFEFF" + headers.join(";") + "\r\n";
    candidatosFiltrados.forEach((c: Candidate) => {
      const row = [`"${c.fecha}"`, `"${c.nombre}"`, `"${c.dni || ''}"`, `"${c.fecha_nac || ''}"`, `"${c.telefono || ''}"`, `"${c.email || ''}"`, `"${c.localidad || ''}"`, `"${c.provincia || ''}"`, `"${c.linkedin || ''}"`, `"${c.sector || ''}"`, `"${c.puesto || ''}"`, `"${c.buena_conducta || ''}"`, `"${c.carnet_manejo || ''}"`, `"${c.nivel_educativo || ''}"`, `"${c.titulo || ''}"`, `"${(c.areas_exp || []).join(', ')} ${c.areas_exp_otros ? '(' + c.areas_exp_otros + ')' : ''}"`, `"${(c.habilidades || []).join(', ')} ${c.habilidades_otros ? '(' + c.habilidades_otros + ')' : ''}"`, `"${c.anios_exp || ''}"`, `"${c.ultimo_cargo || ''}"`, `"${c.ultima_empresa || ''}"`, `"${(c.test_results || []).map((t: any) => t.test + ': ' + t.score).join(' | ')}"`, `"${c.observaciones || ''}"`];
      csv += row.join(";") + "\r\n";
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Base_Candidatos_CV_Consultora.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <>
      <section className="bg-[#1A1A1A] overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-wrap justify-between items-center border-b border-[#2A2A2A] gap-4">
          <h3 className="text-lg font-semibold text-white">Base de Datos ({candidatosFiltrados.length} de {candidates.length})</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type="text" placeholder="Filtrar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={inputClass + ' pl-10'} />
            </div>
            <button onClick={exportCSV} className="flex items-center justify-center gap-2 bg-[#1F1F1F] text-[#E6CA65] border border-[#E6CA65]/40 hover:bg-[#2A2A2A] px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap"><FileSpreadsheet className="w-4 h-4" /> Exportar Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1F1F1F] text-[#E6CA65] border-b border-[#333] text-xs tracking-wider">
                <th className="py-3.5 px-4">FECHA</th><th className="py-3.5 px-4">NOMBRE</th><th className="py-3.5 px-4">DNI</th><th className="py-3.5 px-4">EMAIL</th><th className="py-3.5 px-4">PUESTO</th><th className="py-3.5 px-4">TESTS</th><th className="py-3.5 px-4">OBS. ADMIN</th><th className="py-3.5 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] text-sm text-gray-300">
              {candidatosFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">{searchQuery ? 'No se encontraron resultados para la búsqueda.' : 'No hay postulaciones aún.'}</p>
                </td></tr>
              ) : candidatosFiltrados.map((c: Candidate) => (
                <tr key={c.id} className="hover:bg-[#222]">
                  <td className="py-3 px-4 text-xs text-gray-400">{c.fecha}</td>
                  <td className="py-3 px-4 font-medium text-white">{c.nombre}</td>
                  <td className="py-3 px-4 text-xs text-gray-300">{c.dni || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-300">{c.email || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-200">{c.puesto}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 max-w-[200px] truncate">{(c.test_results || []).map((t: any) => `${t.test}: ${t.score}`).join(' | ') || 'Sin tests'}</td>
                  <td className="py-3 px-4 relative">
                    <textarea value={c.observaciones || ''} onChange={e => actualizarObservacion(c.id, e.target.value)} placeholder="Escribir..." className="w-full bg-[#252525] border border-[#333] text-gray-200 text-xs rounded p-1.5 h-10 resize-none focus:outline-none focus:border-[#E6CA65]"></textarea>
                    {savingId === c.id && <span className="absolute top-1 right-1 text-[8px] text-[#E6CA65]">guardando...</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button onClick={() => setPerfilParaVer(c)} className="text-xs text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 px-2 py-1 rounded flex items-center gap-1 mb-1"><Eye className="w-3 h-3" /> Perfil</button>
                      {c.cv && (<button onClick={() => setCvParaVer(c)} className="text-xs text-gray-200 bg-[#2B2B2B] hover:bg-[#383838] px-2 py-1 rounded border border-[#444] flex items-center gap-1 mb-1"><FileText className="w-3 h-3 text-[#E6CA65]" /> CV</button>)}
                      <button onClick={() => eliminarCandidato(c.id)} className="text-xs text-red-400 bg-red-900/20 hover:bg-red-900/40 px-2 py-1 rounded flex items-center gap-1 mb-1"><Trash2 className="w-3 h-3" /> Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CV Viewer Modal */}
      <Modal
        open={!!cvParaVer}
        onClose={() => setCvParaVer(null)}
        title={cvParaVer?.cv?.nombre}
        subtitle={`Candidato: ${cvParaVer?.nombre}`}
        icon={<FileText className="w-5 h-5" />}
        size="xl"
        headerRight={
          cvParaVer && (
            <a href={cvParaVer.cv?.url} download={cvParaVer.cv?.nombre}
              className="inline-flex items-center gap-1.5 text-xs text-black bg-[#E6CA65] hover:bg-[#d8bd58] px-3 py-1.5 rounded-lg font-bold transition-colors">
              <Download className="w-3 h-3" /> Descargar
            </a>
          )
        }
      >
        <div className="bg-[#121212] p-2 h-[70vh]">
          {cvParaVer && (
            <iframe src={cvParaVer.cv?.url} title={`CV de ${cvParaVer.nombre}`} className="w-full h-full rounded border border-[#222]" />
          )}
        </div>
      </Modal>

      {/* Profile Viewer Modal */}
      <Modal
        open={!!perfilParaVer}
        onClose={() => setPerfilParaVer(null)}
        title={`Perfil de ${perfilParaVer?.nombre}`}
        icon={<Eye className="w-5 h-5" />}
        size="xl"
      >
        {perfilParaVer && (
          <div className="p-4 sm:p-6 space-y-6 text-sm">
            <div>
              <h4 className="text-[#F2D2A0] font-bold mb-3 border-b border-[#333] pb-2">Información Personal</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-gray-500 text-xs">Fecha Postulación</p><p className="text-white">{perfilParaVer.fecha}</p></div>
                <div><p className="text-gray-500 text-xs">Nombre</p><p className="text-white">{perfilParaVer.nombre}</p></div>
                <div><p className="text-gray-500 text-xs">DNI</p><p className="text-white">{perfilParaVer.dni || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Fecha Nacimiento</p><p className="text-white">{perfilParaVer.fecha_nac || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Teléfono</p><p className="text-white">{perfilParaVer.telefono || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Email</p><p className="text-white break-all">{perfilParaVer.email || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Localidad</p><p className="text-white">{perfilParaVer.localidad || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Provincia</p><p className="text-white">{perfilParaVer.provincia || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">LinkedIn</p><p className="text-white break-all">{perfilParaVer.linkedin || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Sector</p><p className="text-white">{perfilParaVer.sector || 'N/A'}{perfilParaVer.sector === 'Público' && perfilParaVer.sector_publico_detalle ? ` — ${perfilParaVer.sector_publico_detalle}` : ''}</p></div>
              </div>
            </div>
            <div>
              <h4 className="text-[#F2D2A0] font-bold mb-3 border-b border-[#333] pb-2">Información Profesional</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-gray-500 text-xs">Puesto</p><p className="text-white">{perfilParaVer.puesto}</p></div>
                <div><p className="text-gray-500 text-xs">Años Exp.</p><p className="text-white">{perfilParaVer.anios_exp || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Último Cargo</p><p className="text-white">{perfilParaVer.ultimo_cargo || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Última Empresa</p><p className="text-white">{perfilParaVer.ultima_empresa || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Buena Conducta</p><p className="text-white">{perfilParaVer.buena_conducta || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Carnet</p><p className="text-white">{perfilParaVer.carnet_manejo || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Nivel Educativo</p><p className="text-white">{perfilParaVer.nivel_educativo || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">Título</p><p className="text-white">{perfilParaVer.titulo || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs">CV Adjunto</p>{perfilParaVer.cv ? <button onClick={() => setCvParaVer(perfilParaVer)} className="text-blue-400 hover:underline text-xs flex items-center gap-1 mt-1"><FileText className="w-3 h-3" /> Ver/Descargar</button> : <p className="text-white">No adjuntado</p>}</div>
              </div>
            </div>
            <div>
              <h4 className="text-[#F2D2A0] font-bold mb-3 border-b border-[#333] pb-2">Áreas y Habilidades (ATS)</h4>
              <div className="mb-4">
                <p className="text-gray-500 text-xs mb-2">Áreas de Experiencia:</p>
                <div className="flex flex-wrap gap-2">
                  {(perfilParaVer.areas_exp || []).map((a: string) => <span key={a} className="bg-[#252525] border border-[#444] text-xs px-2 py-1 rounded text-[#E6CA65]">{a}</span>)}
                  {perfilParaVer.areas_exp_otros && <span className="bg-[#252525] border border-[#444] text-xs px-2 py-1 rounded text-blue-400">Otros: {perfilParaVer.areas_exp_otros}</span>}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">Habilidades:</p>
                <div className="flex flex-wrap gap-2">
                  {(perfilParaVer.habilidades || []).map((h: string) => <span key={h} className="bg-[#252525] border border-[#444] text-xs px-2 py-1 rounded text-[#E6CA65]">{h}</span>)}
                  {perfilParaVer.habilidades_otros && <span className="bg-[#252525] border border-[#444] text-xs px-2 py-1 rounded text-blue-400">Otros: {perfilParaVer.habilidades_otros}</span>}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[#F2D2A0] font-bold mb-3 border-b border-[#333] pb-2">Evaluaciones Psicotécnicas</h4>
              {perfilParaVer.test_results && perfilParaVer.test_results.length > 0 ? (
                <div className="space-y-2">
                  {perfilParaVer.test_results.map((tr: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-[#252525] p-3 rounded text-sm">
                      <span className="text-gray-300 flex items-center gap-2"><Brain className="w-4 h-4 text-[#E6CA65]" /> {tr.test}</span>
                      <span className="text-[#E6CA65] font-bold text-base">{tr.score}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-600 text-xs">Sin tests realizados.</p>}
            </div>
            <div>
              <h4 className="text-[#F2D2A0] font-bold mb-3 border-b border-[#333] pb-2">Observaciones</h4>
              <textarea value={perfilParaVer.observaciones || ''} onChange={e => { actualizarObservacion(perfilParaVer.id, e.target.value); setPerfilParaVer({ ...perfilParaVer, observaciones: e.target.value }); }} placeholder="Observaciones..." className="w-full bg-[#252525] border border-[#333] text-gray-200 text-sm rounded p-3 h-24 resize-y focus:outline-none focus:border-[#E6CA65]"></textarea>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
