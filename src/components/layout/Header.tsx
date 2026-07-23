import { Shield, Lock } from 'lucide-react';

interface Props {
  isAdmin?: boolean;
  candidatosCount?: number;
}

export default function Header({ isAdmin = false, candidatosCount = 0 }: Props) {
  return (
    <header className="border-b border-[#2A2A2A] bg-[#1A1A1A] sticky top-0 z-40 shadow-md backdrop-blur-md bg-[#1A1A1A]/90">
      <div className="w-full py-4 flex flex-wrap justify-between items-center px-3 sm:px-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#E6CA65] animate-pulse-text">CV CONSULTORA</h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#fcf6ba]/80">Gestión de Recursos Humanos</p>
          <p className="text-sm text-gray-300 font-light tracking-wide">Lic. Gisela Palacios</p>
          <div className="w-24 animate-line-appear mt-2"></div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-xs sm:text-sm text-gray-400">
            <a href="mailto:consultoracv.sanluis@gmail.com" className="flex items-center gap-1.5 hover:text-[#E6CA65] transition-colors">
              <span className="text-[#E6CA65]">✉️</span> consultoracv.sanluis@gmail.com
            </a>
            <span className="flex items-center gap-1.5">
              <span className="text-[#E6CA65]">📍</span> Villa Mercedes, San Luis
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-[#252525] border border-[#333] px-3 py-1.5 rounded-full text-xs text-gray-300">
              <Shield className="w-4 h-4 text-[#E6CA65]" /> <span>Panel Protegido</span>
              <Lock className="w-4 h-4 ml-2 text-emerald-400" /> <span className="text-emerald-400">Sesión</span>
            </div>
          )}
          {candidatosCount > 0 && isAdmin && (
            <div className="relative">
              <span className="text-[#E6CA65] text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] w-3 h-3 rounded-full flex items-center justify-center text-white">{candidatosCount}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
