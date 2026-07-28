import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: React.ReactNode;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export default function Modal({ open, onClose, title, subtitle, icon, size = 'md', actions, children, headerRight }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-pop-in"
    >
      <div className={`relative bg-[#1A1A1A] border border-[#444] rounded-xl w-full ${sizeClasses[size]} shadow-2xl shadow-black/50 flex flex-col max-h-[90vh] overflow-hidden`}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white bg-black/60 hover:bg-black/80 p-1.5 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        {(title || headerRight) && (
          <div className="px-5 py-4 border-b border-[#2A2A2A] flex justify-between items-center bg-[#1F1F1F] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && <div className="text-[#E6CA65] flex-shrink-0">{icon}</div>}
              <div className="min-w-0">
                {title && <h3 className="text-sm font-bold text-white truncate">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {headerRight}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>

        {actions && (
          <div className="px-5 py-3 border-t border-[#2A2A2A] bg-[#1F1F1F] flex items-center justify-end gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
