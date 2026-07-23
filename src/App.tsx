import { useState, useCallback } from 'react';
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
import type { TabId, Notification as NotificationType } from './lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<NotificationType | null>(null);

  const triggerNotification = useCallback((message: string) => {
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

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 flex flex-col font-sans antialiased selection:bg-[#E6CA65] selection:text-black">
      <Header />

      {showNotificationPopup && latestNotification && (
        <NotificationPopup notification={latestNotification} onClose={() => setShowNotificationPopup(false)} />
      )}

      <Navbar activeTab={activeTab} isAdmin={isAdminLoggedIn} onTabChange={setActiveTab} onLogout={() => setIsAdminLoggedIn(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'inicio' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'postulate' && <Postulate onNavigate={setActiveTab} onPostulation={triggerNotification} />}
        {activeTab === 'vacantes' && <Vacancies isAdmin={isAdminLoggedIn} onNavigateToPostulate={() => setActiveTab('postulate')} />}
        {activeTab === 'novedades' && <News isAdmin={isAdminLoggedIn} />}
        {activeTab === 'tests' && <Tests />}
        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} onNotification={triggerNotification} />
          ) : (
            <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
          )
        )}
      </main>
    </div>
  );
}
