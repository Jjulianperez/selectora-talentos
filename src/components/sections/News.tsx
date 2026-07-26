import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Pencil, Download, ExternalLink, MessageCircle, Newspaper } from 'lucide-react';
import { supabase, BUCKET_NAME } from '../../lib/supabase';
import type { News as NewsType, Attachment } from '../../lib/types';

interface Props {
  isAdmin: boolean;
}

interface AdjuntoForm {
  nombre: string;
  tipo: 'foto' | 'video' | 'documento';
  url: string;
}

export default function News({ isAdmin }: Props) {
  const [news, setNews] = useState<NewsType[]>([]);
  const [nuevaNovedad, setNuevaNovedad] = useState({ titulo: '', descripcion: '', adjuntos: [] as AdjuntoForm[], url: '' });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNews(data.map(n => ({ ...n, adjuntos: n.adjuntos || [] }))); });
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
    setNuevaNovedad(prev => ({ ...prev, adjuntos: [...prev.adjuntos, ...nuevos] }));
  };

  const removerAdjunto = (index: number) => setNuevaNovedad(prev => ({ ...prev, adjuntos: prev.adjuntos.filter((_, i) => i !== index) }));

  const guardarNovedad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNovedad.titulo) return;
    if (editandoId) {
      await supabase.from('news').update({ titulo: nuevaNovedad.titulo, descripcion: nuevaNovedad.descripcion, adjuntos: nuevaNovedad.adjuntos, url: nuevaNovedad.url }).eq('id', editandoId);
      setNews(news.map(n => n.id === editandoId ? { ...n, ...nuevaNovedad } : n));
      setEditandoId(null);
    } else {
      const created = { id: 'NOV-' + Date.now(), ...nuevaNovedad, fecha: new Date().toLocaleDateString('es-AR') };
      await supabase.from('news').insert(created);
      setNews([created, ...news]);
    }
    setNuevaNovedad({ titulo: '', descripcion: '', adjuntos: [], url: '' });
  };

  const editarNovedad = (n: NewsType) => { setNuevaNovedad({ titulo: n.titulo, descripcion: n.descripcion, adjuntos: n.adjuntos || [], url: n.url }); setEditandoId(n.id); };
  const eliminarNovedad = async (id: string) => {
    if (!confirm('¿Eliminar novedad?')) return;
    await supabase.from('news').delete().eq('id', id);
    setNews(news.filter(n => n.id !== id));
    if (editandoId === id) { setNuevaNovedad({ titulo: '', descripcion: '', adjuntos: [], url: '' }); setEditandoId(null); }
  };

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1";

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div className="bg-[#1A1A1A] p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-[#E6CA65]">{editandoId ? 'Editar Novedad' : 'Publicar Nueva Novedad'}</h3>
            {editandoId && (
              <button onClick={() => { setNuevaNovedad({ titulo: '', descripcion: '', adjuntos: [], url: '' }); setEditandoId(null); }}
                className="text-xs text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Cancelar Edición</button>
            )}
          </div>
          <form onSubmit={guardarNovedad} className="space-y-4">
            <input required type="text" placeholder="Título de la Novedad" value={nuevaNovedad.titulo} onChange={e => setNuevaNovedad({ ...nuevaNovedad, titulo: e.target.value })} className={inputClass} />
            <textarea required placeholder="Descripción detallada..." rows={3} value={nuevaNovedad.descripcion} onChange={e => setNuevaNovedad({ ...nuevaNovedad, descripcion: e.target.value })} className={inputClass} />
            <div>
              <label className="form-label">Enlace / URL (Opcional)</label>
              <input type="url" placeholder="https://ejemplo.com/informacion" value={nuevaNovedad.url} onChange={e => setNuevaNovedad({ ...nuevaNovedad, url: e.target.value })} className={inputClass} />
            </div>
            <div className="mt-4">
              <label className="form-label">Adjuntar Archivos</label>
              <div className="flex items-center gap-4 border border-dashed border-[#444] p-4 rounded-lg bg-[#222]">
                <label className="flex items-center gap-2 bg-[#2D2D2D] border border-[#555] text-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#383838] transition text-sm">
                  <Upload className="w-4 h-4" /> Seleccionar Archivos
                  <input type="file" multiple onChange={handleAdjuntarArchivos} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                </label>
                <span className="text-xs text-gray-500">{nuevaNovedad.adjuntos.length} archivo(s)</span>
              </div>
              {nuevaNovedad.adjuntos.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {nuevaNovedad.adjuntos.map((adj, i) => (
                    <div key={i} className="media-thumb group">
                      {adj.tipo === 'foto' && <img src={adj.url} alt={adj.nombre} />}
                      {adj.tipo === 'video' && <video src={adj.url} muted />}
                      {adj.tipo === 'documento' && (<div className="flex flex-col items-center justify-center h-full p-2 text-center bg-[#252525]"><FileText className="w-6 h-6 text-[#E6CA65] mb-1" /><span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span></div>)}
                      <button type="button" onClick={() => removerAdjunto(i)} className="media-overlay" style={{ opacity: 1, background: 'rgba(255,0,0,0.4)' }}><Trash2 className="w-4 h-4 text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-[#E6CA65] text-black font-bold py-2.5 px-6 rounded-lg text-sm w-full md:w-auto">{editandoId ? 'Guardar Cambios' : 'Publicar Novedad'}</button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Novedades</h2>
        {news.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {news.map(item => (
              <div key={item.id} className="content-card min-w-[280px] md:min-w-[350px] snap-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700/50 text-gray-400">{item.fecha || 'Publicado'}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 flex-grow">{item.descripcion}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#E6CA65] hover:underline mb-4 break-all"><ExternalLink className="w-3 h-3" /> {item.url}</a>
                )}
                {item.adjuntos && item.adjuntos.length > 0 && (
                  <div className="mb-4 border-t border-[#333] pt-3">
                    <p className="text-xs text-gray-500 mb-2">Adjuntos:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {item.adjuntos.map((adj, i) => (
                        <div key={i} className="media-thumb group">
                          {adj.tipo === 'foto' && <img src={adj.url} alt={adj.nombre} />}
                          {adj.tipo === 'video' && <video src={adj.url} muted />}
                          {adj.tipo === 'documento' && (<div className="flex flex-col items-center justify-center h-full p-2 text-center bg-[#252525]"><FileText className="w-6 h-6 text-[#E6CA65] mb-1" /><span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span></div>)}
                          <a href={adj.url} target="_blank" download={adj.nombre} className="media-overlay"><Download className="w-5 h-5 text-white" /></a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-auto">
                  {!isAdmin && (
                    <a href={`https://wa.me/5492657234459?text=${encodeURIComponent("Hola, quisiera más información sobre: " + item.titulo)}`} target="_blank" rel="noopener noreferrer"
                      className="w-full bg-green-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2 transition"><MessageCircle className="w-4 h-4" /> Solicitar más información</a>
                  )}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => editarNovedad(item)} className="flex-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-900/50"><Pencil className="w-3 h-3" /> Editar</button>
                      <button onClick={() => eliminarNovedad(item.id)} className="flex-1 bg-red-900/30 text-red-400 border border-red-800/50 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-900/50"><Trash2 className="w-3 h-3" /> Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Newspaper className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay novedades por el momento.</p>
            <p className="text-xs text-gray-600 mt-1">Volvé pronto para estar al tanto de las últimas noticias.</p>
          </div>
        )}
      </div>
    </div>
  );
}
