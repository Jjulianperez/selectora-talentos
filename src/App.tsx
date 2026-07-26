import { useState, useCallback, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Home from './components/sections/Home';
import Postulate from './components/sections/Postulate';
import Vacancies from './components/sections/Vacancies';
import News from './components/sections/News';
import Tests from './components/sections/Tests';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import NotificationPopup from './components/ui/NotificationPopup';
import { supabase } from './lib/supabase';
import type { TabId, Notification as NotificationType } from './lib/types';

function useIsAdminRoute() {
  const [is, setIs] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    const onPop = () => setIs(window.location.pathname === '/admin');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
      setIs(true);
    }
  };

  const goHome = () => {
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
      setIs(false);
    }
  };

  return { is, goAdmin, goHome };
}

export default function App() {
  const { is: isAdminRoute, goAdmin, goHome } = useIsAdminRoute();
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<NotificationType | null>(null);
  const [contentKey, setContentKey] = useState(0);
  const [preselectVacancy, setPreselectVacancy] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAdminLoggedIn(true);
    });
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setContentKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerNotification = useCallback((message: string) => {
    const newNotif: NotificationType = {
      id: Date.now(),
      text: message,
      time: new Date().toLocaleTimeString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const triggerAdminNotification = useCallback((message: string) => {
    const newNotif: NotificationType = {
      id: Date.now(),
      text: message,
      time: new Date().toLocaleTimeString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setLatestNotification(newNotif);
    setShowNotificationPopup(true);
    setTimeout(() => setShowNotificationPopup(false), 6000);
  }, []);

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    goHome();
  };

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-100 flex flex-col font-sans antialiased selection:bg-[#E6CA65] selection:text-black">
        <Header isAdmin={isAdminLoggedIn} candidatosCount={notifications.length} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {isAdminLoggedIn ? (
            <AdminDashboard onLogout={handleAdminLogout} onNotification={triggerAdminNotification} />
          ) : (
            <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
          )}
        </main>

        {showNotificationPopup && latestNotification && (
          <NotificationPopup notification={latestNotification} onClose={() => setShowNotificationPopup(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 flex flex-col font-sans antialiased selection:bg-[#E6CA65] selection:text-black">
      <Header />
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 pb-20 md:pb-8">
        <div key={contentKey} className="animate-fade-up">
          {activeTab === 'inicio' && <Home onNavigate={handleTabChange} />}
          {activeTab === 'postulate' && (
            <Postulate
              onNavigate={handleTabChange}
              onPostulation={triggerNotification}
              preselectVacancy={preselectVacancy}
              onVacancyConsumed={() => setPreselectVacancy(null)}
            />
          )}
          {activeTab === 'vacantes' && (
            <Vacancies
              onNavigateToPostulate={(vacancyTitle) => {
                setPreselectVacancy(vacancyTitle);
                handleTabChange('postulate');
              }}
            />
          )}
          {activeTab === 'novedades' && <News isAdmin={isAdminLoggedIn} />}
          {activeTab === 'tests' && <Tests />}
        </div>
      </main>

      {activeTab !== 'inicio' && (
        <a
          href="https://wa.me/5492657234459?text=Hola%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[72px] md:bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:bg-[#20ba5a] transition-colors wa-float"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}
    </div>
  );
}
