import { Home, FileText, Briefcase, Bell, FlaskConical } from 'lucide-react';
import type { TabId } from '../../lib/types';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; icon: React.ReactNode; label: string }[] = [
  { id: 'inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
  { id: 'postulate', icon: <FileText className="w-5 h-5" />, label: 'Postulate' },
  { id: 'vacantes', icon: <Briefcase className="w-5 h-5" />, label: 'Vacantes' },
  { id: 'novedades', icon: <Bell className="w-5 h-5" />, label: 'Novedades' },
  { id: 'tests', icon: <FlaskConical className="w-5 h-5" />, label: 'Tests' },
];

export default function Navbar({ activeTab, onTabChange }: Props) {
  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161616]/98 backdrop-blur-md border-t border-[#2A2A2A] safe-area-bottom">
        <div className="flex items-stretch">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] relative transition-colors duration-150 ${
                  isActive ? 'text-[#E6CA65]' : 'text-gray-500'
                }`}
              >
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#E6CA65] rounded-full"></div>}
                {t.icon}
                <span className="text-[10px] font-semibold leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop: sticky top bar */}
      <nav className="hidden md:block bg-[#161616] border-t border-[#2A2A2A] sticky top-[80px] z-30">
        <div className="w-full px-2 sm:px-4 flex gap-0.5 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 min-h-[44px] ${
                activeTab === t.id
                  ? 'text-[#E6CA65] bg-[#E6CA65]/8 border-b-2 border-[#E6CA65]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/3 border-b-2 border-transparent'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
