import { useState, useEffect } from 'react';
import { supabase, BUCKET_NAME } from '../../lib/supabase';
import type { Vacancy, Attachment } from '../../lib/types';

interface Props {
  isAdmin: boolean;
  onNavigateToPostulate: () => void;
}

interface AdjuntoForm {
  nombre: string;
  tipo: 'foto' | 'video' | 'documento';
  url: string;
}

export default function Vacancies({ isAdmin, onNavigateToPostulate }: Props) {
  const [vacantes, setVacantes] = useState<Vacancy[]>([]);
  const [nuevaVacante, setNuevaVacante] = useState({ titulo: '', estado: 'Urgente', descripcion: '', adjuntos: [] as AdjuntoForm[] });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('vacancies').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setVacantes(data.map(v => ({ ...v, adjuntos: v.adjuntos || [] }))); });
  }, []);

  const handleAdjuntarArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nuevos: AdjuntoForm[] = [];
    for (const f of files) {
      const filePath = `attachments/${Date.now()}_${f.name}`;
      const { data } = await supabase.storage.from(BUCKET_NAME).upload(filePath, f);
      if (data) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
        nuevos.push({ nombre: f.name, tipo: f.type.includes('image') ? 'foto' : f.type.includes('video') ? 'video' : 'documento', url: urlData.publicUrl });
      }
    }
    setNuevaVacante(prev => ({ ...prev, adjuntos: [...prev.adjuntos, ...nuevos] }));
  };

  const removerAdjunto = (index: number) => setNuevaVacante(prev => ({ ...prev, adjuntos: prev.adjuntos.filter((_, i) => i !== index) }));

  const guardarVacante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaVacante.titulo) return;
    if (editandoId) {
      await supabase.from('vacancies').update({ titulo: nuevaVacante.titulo, estado: nuevaVacante.estado, descripcion: nuevaVacante.descripcion, adjuntos: nuevaVacante.adjuntos }).eq('id', editandoId);
      setVacantes(vacantes.map(v => v.id === editandoId ? { ...v, ...nuevaVacante } : v));
      setEditandoId(null);
    } else {
      const created = { id: 'VAC-' + Date.now(), ...nuevaVacante };
      await supabase.from('vacancies').insert(created);
      setVacantes([created, ...vacantes]);
    }
    setNuevaVacante({ titulo: '', estado: 'Urgente', descripcion: '', adjuntos: [] });
  };

  const editarVacante = (v: Vacancy) => { setNuevaVacante({ titulo: v.titulo, estado: v.estado, descripcion: v.descripcion, adjuntos: v.adjuntos || [] }); setEditandoId(v.id); };
  const eliminarVacante = async (id: string) => {
    if (!confirm('¿Eliminar vacante?')) return;
    await supabase.from('vacancies').delete().eq('id', id);
    setVacantes(vacantes.filter(v => v.id !== id));
    if (editandoId === id) { setNuevaVacante({ titulo: '', estado: 'Urgente', descripcion: '', adjuntos: [] }); setEditandoId(null); }
  };

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1";

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div className="bg-[#1A1A1A] p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-[#E6CA65]">{editandoId ? 'Editar Vacante' : 'Publicar Nueva Vacante'}</h3>
            {editandoId && (
              <button onClick={() => { setNuevaVacante({ titulo: '', estado: 'Urgente', descripcion: '', adjuntos: [] }); setEditandoId(null); }}
                className="text-xs text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Cancelar Edición</button>
            )}
          </div>
          <form onSubmit={guardarVacante} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><input required type="text" placeholder="Título de la Vacante" value={nuevaVacante.titulo} onChange={e => setNuevaVacante({ ...nuevaVacante, titulo: e.target.value })} className={inputClass} /></div>
              <select value={nuevaVacante.estado} onChange={e => setNuevaVacante({ ...nuevaVacante, estado: e.target.value })} className={inputClass}>
                <option value="Urgente">⚡ Urgente</option><option value="En proceso">🔄 En Proceso</option><option value="Finalizada">✔️ Finalizada</option>
              </select>
            </div>
            <textarea required placeholder="Descripción del puesto y requisitos" rows={3} value={nuevaVacante.descripcion} onChange={e => setNuevaVacante({ ...nuevaVacante, descripcion: e.target.value })} className={inputClass} />

            <div className="mt-4">
              <label className="form-label">Adjuntar Archivos</label>
              <div className="flex items-center gap-4 border border-dashed border-[#444] p-4 rounded-lg bg-[#222]">
                <label className="flex items-center gap-2 bg-[#2D2D2D] border border-[#555] text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#383838] transition text-sm">
                  ⬆️ Seleccionar Archivos
                  <input type="file" multiple onChange={handleAdjuntarArchivos} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                </label>
                <span className="text-xs text-gray-500">{nuevaVacante.adjuntos.length} archivo(s)</span>
              </div>
              {nuevaVacante.adjuntos.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {nuevaVacante.adjuntos.map((adj, i) => (
                    <div key={i} className="media-thumb group">
                      {adj.tipo === 'foto' && <img src={adj.url} alt={adj.nombre} />}
                      {adj.tipo === 'video' && <video src={adj.url} muted />}
                      {adj.tipo === 'documento' && (<div className="flex flex-col items-center justify-center h-full p-2 text-center bg-[#252525]"><span className="text-2xl text-[#E6CA65] mb-1">📄</span><span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span></div>)}
                      <button type="button" onClick={() => removerAdjunto(i)} className="media-overlay" style={{ opacity: 1, background: 'rgba(255,0,0,0.4)' }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="bg-[#E6CA65] text-black font-bold py-2.5 px-6 rounded-lg text-sm w-full md:w-auto">{editandoId ? 'Guardar Cambios' : 'Publicar Vacante'}</button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Vacantes Disponibles</h2>
        {vacantes.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {vacantes.map(item => (
              <div key={item.id} className="min-w-[280px] md:min-w-[350px] snap-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${item.estado === 'Urgente' ? 'bg-red-900/50 text-red-400' : item.estado === 'Finalizada' ? 'bg-gray-700/50 text-gray-400' : 'bg-blue-900/50 text-blue-400'}`}>{item.estado}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 flex-grow">{item.descripcion}</p>
                {item.adjuntos && item.adjuntos.length > 0 && (
                  <div className="mb-4 border-t border-[#333] pt-3">
                    <p className="text-xs text-gray-500 mb-2">Adjuntos:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {item.adjuntos.map((adj, i) => (
                        <div key={i} className="media-thumb group">
                          {adj.tipo === 'foto' && <img src={adj.url} alt={adj.nombre} />}
                          {adj.tipo === 'video' && <video src={adj.url} muted />}
                          {adj.tipo === 'documento' && (<div className="flex flex-col items-center justify-center h-full p-2 text-center bg-[#252525]"><span className="text-2xl text-[#E6CA65] mb-1">📄</span><span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span></div>)}
                          <a href={adj.url} target="_blank" download={adj.nombre} className="media-overlay"><span className="text-white text-xl">⬇️</span></a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-auto">
                  {!isAdmin && (
                    <button onClick={onNavigateToPostulate} className="w-full bg-[#E6CA65] text-black font-bold py-2 rounded-lg text-base hover:bg-[#d8bd58]">Postularme</button>
                  )}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => editarVacante(item)} className="flex-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-900/50">✏️ Editar</button>
                      <button onClick={() => eliminarVacante(item.id)} className="flex-1 bg-red-900/30 text-red-400 border border-red-800/50 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-900/50">🗑️ Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay vacantes.</p>
        )}
      </div>
    </div>
  );
}
