import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, MessageCircle, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { News as NewsType } from '../../lib/types';

export default function News() {
  const [news, setNews] = useState<NewsType[]>([]);

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNews(data.map(n => ({ ...n, adjuntos: n.adjuntos || [] }))); });
  }, []);

  return (
    <div className="space-y-8">
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
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#E6CA65] hover:underline mb-4 break-all"><ExternalLink className="w-3 h-3" /> Ver más</a>
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
                <a href={`https://wa.me/5492657234459?text=${encodeURIComponent("Hola, quisiera más información sobre: " + item.titulo)}`} target="_blank" rel="noopener noreferrer"
                  className="mt-auto w-full bg-green-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2 transition"><MessageCircle className="w-4 h-4" /> Solicitar más información</a>
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
