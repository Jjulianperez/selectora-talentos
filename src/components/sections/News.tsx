import { useState, useEffect } from 'react';
import { FileText, ExternalLink, MessageCircle, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import type { News as NewsType, Attachment } from '../../lib/types';

export default function News() {
  const [news, setNews] = useState<NewsType[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Attachment | null>(null);

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNews(data.map(n => ({ ...n, adjuntos: n.adjuntos || [] }))); });
  }, []);

  const truncar = (texto: string, max: number) => {
    if (texto.length <= max) return texto;
    return texto.substring(0, max).trimEnd();
  };

  return (
    <div className="space-y-8">
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} size="full">
        {lightbox && (
          <div className="flex items-center justify-center p-4">
            <img src={lightbox.url} alt={lightbox.nombre} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        )}
      </Modal>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Novedades</h2>
        {news.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {news.map(item => {
              const esLarga = item.descripcion.length > 150;
              const estaExpandida = expandedId === item.id;
              return (
                <div key={item.id} className="content-card min-w-[280px] md:min-w-[360px] snap-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-lg flex flex-col overflow-hidden">
                  {item.adjuntos.filter(a => a.tipo === 'foto').length > 0 && (
                    <div className="w-full h-44 overflow-hidden bg-[#111] flex-shrink-0">
                      <img
                        src={item.adjuntos.filter(a => a.tipo === 'foto')[0].url}
                        alt={item.titulo}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightbox(item.adjuntos.filter(a => a.tipo === 'foto')[0])}
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700/50 text-gray-400 whitespace-nowrap flex-shrink-0">{item.fecha || 'Publicado'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2 leading-relaxed">
                        {estaExpandida ? item.descripcion : truncar(item.descripcion, 150)}
                        {esLarga && !estaExpandida && '...'}
                      </p>
                      {esLarga && (
                        <button type="button" onClick={() => setExpandedId(estaExpandida ? null : item.id)} className="text-xs text-[#E6CA65] hover:underline mb-2">
                          {estaExpandida ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#E6CA65] hover:underline mb-4 break-all"><ExternalLink className="w-3 h-3" /> Ver más</a>
                      )}
                      {item.adjuntos.filter(a => a.tipo !== 'foto' || item.adjuntos.indexOf(a) !== 0).length > 0 && (
                        <div className="mb-4 border-t border-[#333] pt-3">
                          <p className="text-xs text-gray-500 mb-2">Adjuntos:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {item.adjuntos.map((adj, i) => {
                              if (i === 0 && adj.tipo === 'foto') return null;
                              return (
                                <div key={i}>
                                  {adj.tipo === 'foto' ? (
                                    <button type="button" onClick={() => setLightbox(adj)} className="w-full bg-[#252525] border border-[#333] rounded-lg overflow-hidden hover:border-[#555] transition group text-left">
                                      <img src={adj.url} alt={adj.nombre} className="w-full h-28 object-cover" />
                                    </button>
                                  ) : adj.tipo === 'video' ? (
                                    <a href={adj.url} target="_blank" rel="noopener noreferrer" className="block bg-[#252525] border border-[#333] rounded-lg overflow-hidden hover:border-[#555] transition group">
                                      <div className="relative w-full h-28 bg-[#1A1A1A] flex items-center justify-center">
                                        <video src={adj.url} className="w-full h-full object-cover" />
                                        <span className="absolute text-xs text-white bg-black/50 px-2 py-1 rounded">Video</span>
                                      </div>
                                    </a>
                                  ) : (
                                    <a href={adj.url} target="_blank" rel="noopener noreferrer" className="block bg-[#252525] border border-[#333] rounded-lg overflow-hidden hover:border-[#555] transition group">
                                      <div className="flex flex-col items-center justify-center h-28 p-2 text-center">
                                        <FileText className="w-8 h-8 text-[#E6CA65] mb-1" />
                                        <span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span>
                                      </div>
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <a href={`https://wa.me/5492657234459?text=${encodeURIComponent("Hola, quisiera más información sobre: " + item.titulo)}`} target="_blank" rel="noopener noreferrer"
                      className="mt-auto w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2 transition"><MessageCircle className="w-4 h-4" /> Solicitar más información</a>
                  </div>
                </div>
              );
            })}
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
