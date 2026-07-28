import { Shield, Lock, Mail, MapPin, Bell } from 'lucide-react';

interface Props {
  isAdmin?: boolean;
  candidatosCount?: number;
}

export default function Header({ isAdmin = false, candidatosCount = 0 }: Props) {
  return (
    <header className="border-b border-[#2A2A2A] bg-[#1A1A1A]/95 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="w-full py-4 px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-[#E6CA65] glow-gold leading-tight">
            CV CONSULTORA
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#fcf6ba]/50 mt-0.5">
            Gestión de Recursos Humanos
          </p>
          <p className="text-sm sm:text-base font-semibold text-[#F2D2A0] mt-0.5">
            Lic. Gisela Palacios
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 text-xs sm:text-sm text-gray-400 md:flex-shrink-0">
          <a href="mailto:consultoracv.sanluis@gmail.com" className="flex items-center gap-1.5 hover:text-[#E6CA65] transition-colors">
            <Mail className="w-4 h-4 text-[#E6CA65] flex-shrink-0" /> consultoracv.sanluis@gmail.com
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#E6CA65] flex-shrink-0" /> Villa Mercedes, San Luis
          </span>
        </div>

        {isAdmin && (
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-[#252525] border border-[#333] px-3 py-1 rounded-full text-[10px] text-gray-300">
              <Shield className="w-3 h-3 text-[#E6CA65]" /> Panel
              <Lock className="w-3 h-3 ml-1 text-emerald-400" />
            </div>
            {candidatosCount > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4 text-[#E6CA65]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-[7px] w-3 h-3 rounded-full flex items-center justify-center text-white font-bold">{candidatosCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
