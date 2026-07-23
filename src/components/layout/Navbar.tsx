import type { TabId } from '../../lib/types';

interface Props {
  activeTab: TabId;
  isAdmin: boolean;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
}

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'inicio', icon: '🏠', label: 'Inicio' },
  { id: 'postulate', icon: '📝', label: 'Postulate' },
  { id: 'vacantes', icon: '💼', label: 'Vacantes' },
  { id: 'novedades', icon: '🔔', label: 'Novedades' },
  { id: 'tests', icon: '🧠', label: 'Tests' },
  { id: 'admin', icon: '🛡️', label: 'Admin' },
];

export default function Navbar({ activeTab, isAdmin, onTabChange, onLogout }: Props) {
  return (
    <nav className="bg-[#161616] border-t border-[#2A2A2A]">
      <div className="w-full px-3 sm:px-4 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'admin' && isAdmin) {
                onLogout();
              } else {
                onTabChange(t.id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === t.id
                ? 'border-[#E6CA65] text-[#E6CA65]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>{t.icon}</span> {t.id === 'admin' && isAdmin ? 'Cerrar' : t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
