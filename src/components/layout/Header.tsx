import { Shield, Lock, Mail, MapPin, Bell } from 'lucide-react';

interface Props {
  isAdmin?: boolean;
  candidatosCount?: number;
}

export default function Header({ isAdmin = false, candidatosCount = 0 }: Props) {
  return (
    <header className="border-b border-[#2A2A2A] bg-[#1A1A1A]/95 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="w-full py-3 px-3 sm:px-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/LOGO1-removebg-preview.png" alt="CV Consultora" className="h-10 sm:h-12 w-auto object-contain flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-xl font-black tracking-wider text-[#E6CA65] glow-gold leading-tight">CV CONSULTORA</h1>
            <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#fcf6ba]/60 leading-tight hidden sm:block">Gestión de Recursos Humanos</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-5 text-xs text-gray-400">
          <a href="mailto:consultoracv.sanluis@gmail.com" className="flex items-center gap-1.5 hover:text-[#E6CA65] transition-colors">
            <Mail className="w-3.5 h-3.5 text-[#E6CA65]" /> consultoracv.sanluis@gmail.com
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E6CA65]" /> Villa Mercedes, San Luis
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isAdmin && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 bg-[#252525] border border-[#333] px-3 py-1 rounded-full text-[10px] text-gray-300">
                <Shield className="w-3 h-3 text-[#E6CA65]" /> Panel
                <Lock className="w-3 h-3 ml-1 text-emerald-400" />
              </div>
              {candidatosCount > 0 && (
                <div className="relative">
                  <Bell className="w-4 h-4 text-[#E6CA65]" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[7px] w-3 h-3 rounded-full flex items-center justify-center text-white font-bold">{candidatosCount}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
