import type { TabId } from '../../lib/types';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const servicios = [
  { titulo: "Reclutamiento y Selección", desc: "Captamos y evaluamos perfiles estratégicos para impulsar el crecimiento de tu organización.", icon: "👥", color: "text-cyan-400", bg: "bg-cyan-900/10" },
  { titulo: "Contrataciones Eventuales", desc: "Soluciones de personal ágiles y flexibles para cubrir necesidades temporales o proyectos específicos.", icon: "🤝", color: "text-emerald-400", bg: "bg-emerald-900/10" },
  { titulo: "Capacitación y Desarrollo", desc: "Programas diseñados para potenciar competencias y maximizar el potencial de tus equipos.", icon: "📖", color: "text-purple-400", bg: "bg-purple-900/10" },
  { titulo: "Mediación y Resolución de Conflictos", desc: "Gestión profesional de incidencias laborales para fomentar un clima organizacional armónico.", icon: "⚖️", color: "text-orange-400", bg: "bg-orange-900/10" },
  { titulo: "Evaluación de Desempeño y Clima", desc: "Diagnósticos precisos sobre el ambiente de trabajo y el rendimiento para tomar decisiones estratégicas.", icon: "📈", color: "text-blue-400", bg: "bg-blue-900/10" },
  { titulo: "Onboarding e Integración", desc: "Acompañamos la adaptación de nuevos colaboradores para asegurar su retención y productividad.", icon: "🎯", color: "text-pink-400", bg: "bg-pink-900/10" },
];

export default function Home({ onNavigate }: Props) {
  return (
    <div className="space-y-16">
      <div className="relative text-center py-12 sm:py-16 overflow-hidden bg-[#161616]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E6CA65] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <span className="inline-block px-4 py-1 mb-6 text-xs font-semibold tracking-widest text-[#fcf6ba] uppercase border border-[#E6CA65]/30 rounded-full bg-[#E6CA65]/5">Consultora de Recursos Humanos</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] bg-clip-text text-transparent">Transformamos el talento en resultados</h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            Detrás de cada <strong className="font-bold text-[#F2D2A0]">Currículum</strong> hay una historia, esperando la oportunidad correcta, detrás de cada puesto una empresa que merece encontrarla. En <strong className="font-bold text-[#F2D2A0]">CV consultora</strong> nos ocupamos de hacerlo realidad: conectamos personas con propósito, capacidades con desafíos, y equipos con el futuro que necesitan.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-10 text-center tracking-wide">Nuestros Servicios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicios.map((s, i) => (
            <div key={i} className="service-card bg-gradient-to-b from-[#1A1A1A] to-[#121212] border border-[#2A2A2A] p-8 rounded-2xl flex flex-col items-center text-center gap-4 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#E6CA65] opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10 animate-float">
                <div className={`w-16 h-16 flex items-center justify-center rounded-full ${s.bg} border border-[#333]`}>
                  <span className={`text-3xl ${s.color}`}>{s.icon}</span>
                </div>
              </div>
              <h4 className="relative z-10 font-bold text-xl shimmer-text">{s.titulo}</h4>
              <p className="relative z-10 text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              <a href="https://wa.me/5492657234459" target="_blank" rel="noopener noreferrer"
                className="relative z-10 mt-2 text-xs text-green-400 flex items-center gap-1 hover:underline border border-green-900/50 px-4 py-2 rounded-full bg-green-900/10 hover:bg-green-900/20 transition-colors">
                💬 Solicita más información
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
