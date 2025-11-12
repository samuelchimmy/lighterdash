import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomNotificationData {
  id: string;
  title: string;
  body: string;
  direction: 'above' | 'below' | 'neutral';
  type: 'price' | 'volume' | 'funding';
}

interface CustomNotificationProps {
  notification: CustomNotificationData;
  onClose: (id: string) => void;
}

export const CustomNotification = ({ notification, onClose }: CustomNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(notification.id), 300);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [notification.id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const bgClass = notification.direction === 'above' 
    ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600' 
    : notification.direction === 'below'
    ? 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600'
    : 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500';

  const glowClass = notification.direction === 'above'
    ? 'shadow-[0_0_30px_rgba(16,185,129,0.4)]'
    : notification.direction === 'below'
    ? 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
    : 'shadow-[0_0_30px_rgba(251,191,36,0.4)]';

  const icon = notification.direction === 'above' 
    ? <TrendingUp className="w-5 h-5" />
    : notification.direction === 'below'
    ? <TrendingDown className="w-5 h-5" />
    : <Activity className="w-5 h-5" />;

  return (
    <div
      className={cn(
        "relative w-96 rounded-xl overflow-hidden transition-all duration-300 pointer-events-auto",
        "border-2 border-white/20 backdrop-blur-sm",
        bgClass,
        glowClass,
        isVisible ? "animate-slide-in-right" : "animate-slide-out-right"
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
      </div>
      
      <div className="relative p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-white/30 p-2.5 rounded-xl backdrop-blur-md shadow-lg flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="font-bold text-base mb-1.5 truncate drop-shadow-md">
                {notification.title}
              </h4>
              <p className="text-sm text-white/95 leading-relaxed font-medium">
                {notification.body}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 hover:bg-white/25 rounded-lg p-1.5 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 drop-shadow" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-black/20">
        <div 
          className="h-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          style={{
            animation: 'shrink 5s linear forwards'
          }}
        />
      </div>
    </div>
  );
};

export const CustomNotificationContainer = ({ 
  notifications, 
  onClose 
}: { 
  notifications: CustomNotificationData[];
  onClose: (id: string) => void;
}) => {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100000] flex flex-col-reverse items-end gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <CustomNotification key={notification.id} notification={notification} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};
