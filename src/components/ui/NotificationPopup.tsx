import { Bell, X } from 'lucide-react';
import type { Notification as NotificationType } from '../../lib/types';

interface Props {
  notification: NotificationType;
  onClose: () => void;
}

export default function NotificationPopup({ notification, onClose }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-900 border-2 border-amber-500 rounded-xl shadow-2xl shadow-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
          <Bell className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Aviso en Tiempo Real</span>
            <span className="text-[9px] text-neutral-400">{notification.time}</span>
          </div>
          <p className="text-xs text-neutral-200 font-bold mt-1">{notification.text}</p>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
