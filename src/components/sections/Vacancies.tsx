import { useState, useEffect } from 'react';
import { FileText, Download, Briefcase, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Vacancy } from '../../lib/types';

interface Props {
  onNavigateToPostulate: (vacancyTitle: string) => void;
}

export default function Vacancies({ onNavigateToPostulate }: Props) {
  const [vacantes, setVacantes] = useState<Vacancy[]>([]);

  useEffect(() => {
    supabase.from('vacancies').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setVacantes(data.map(v => ({ ...v, adjuntos: v.adjuntos || [] }))); });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Vacantes Disponibles</h2>
        {vacantes.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {vacantes.map(item => (
              <div key={item.id} className="content-card min-w-[280px] md:min-w-[350px] snap-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${item.estado === 'Urgente' ? 'bg-red-900/50 text-red-400' : item.estado === 'Finalizada' ? 'bg-gray-700/50 text-gray-400' : 'bg-blue-900/50 text-blue-400'}`}>{item.estado}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2 flex-grow">{item.descripcion}</p>
                {item.links && (
                  <div className="mb-3 space-y-1">
                    {item.links.split('\n').filter(Boolean).map((link, i) => (
                      <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline truncate">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" /> {link}
                      </a>
                    ))}
                  </div>
                )}
                {item.adjuntos && item.adjuntos.length > 0 && (
                  <div className="mb-4 border-t border-[#333] pt-3">
                    <p className="text-xs text-gray-500 mb-2">Adjuntos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.adjuntos.map((adj, i) => (
                        <a key={i} href={adj.url} target="_blank" rel="noopener noreferrer" className="block bg-[#252525] border border-[#333] rounded-lg overflow-hidden hover:border-[#555] transition group">
                          {adj.tipo === 'foto' ? (
                            <img src={adj.url} alt={adj.nombre} className="w-full h-28 object-cover" />
                          ) : adj.tipo === 'video' ? (
                            <div className="relative w-full h-28 bg-[#1A1A1A] flex items-center justify-center"><video src={adj.url} className="w-full h-full object-cover" /><span className="absolute text-xs text-white bg-black/50 px-2 py-1 rounded">Video</span></div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-28 p-2 text-center">
                              <FileText className="w-8 h-8 text-[#E6CA65] mb-1" />
                              <span className="text-[10px] text-gray-400 truncate w-full">{adj.nombre}</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-auto">
                  <button onClick={() => onNavigateToPostulate(item.titulo)} className="w-full bg-[#E6CA65] text-black font-bold py-2 rounded-lg text-base hover:bg-[#d8bd58]">Postularme</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay vacantes disponibles en este momento.</p>
            <p className="text-xs text-gray-600 mt-1">Checkeá más tarde o postulate de forma espontánea.</p>
          </div>
        )}
      </div>
    </div>
  );
}
