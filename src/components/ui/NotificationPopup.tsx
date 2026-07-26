import { Bell, X } from 'lucide-react';
import type { Notification as NotificationType } from '../../lib/types';

interface Props {
  notification: NotificationType;
  onClose: () => void;
}

export default function NotificationPopup({ notification, onClose }: Props) {
  return (
    <div className="fixed bottom-6 right-20 sm:right-6 z-50 max-w-sm w-[calc(100%-5.5rem)] sm:w-full bg-[#1A1A1A] border border-[#E6CA65]/30 rounded-xl shadow-2xl shadow-black/40 p-4 animate-slide-in-right">
      <div className="flex items-start gap-3">
        <div className="bg-[#E6CA65]/15 p-2 rounded-lg shrink-0">
          <Bell className="w-5 h-5 text-[#E6CA65]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6CA65]">Notificación</span>
            <span className="text-[9px] text-gray-500 shrink-0">{notification.time}</span>
          </div>
          <p className="text-xs text-gray-200 font-medium mt-1 leading-relaxed">{notification.text}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors shrink-0 p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
