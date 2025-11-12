import { useEffect, useState } from 'react';
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
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const bgClass = notification.direction === 'above' 
    ? 'bg-gradient-to-r from-green-500 to-green-600' 
    : notification.direction === 'below'
    ? 'bg-gradient-to-r from-red-500 to-red-600'
    : 'bg-gradient-to-r from-yellow-500 to-yellow-600';

  const icon = notification.direction === 'above' 
    ? <TrendingUp className="w-5 h-5" />
    : notification.direction === 'below'
    ? <TrendingDown className="w-5 h-5" />
    : <Activity className="w-5 h-5" />;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 w-96 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 z-[9999]",
        bgClass,
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 truncate">{notification.title}</h4>
              <p className="text-xs text-white/90 leading-relaxed">{notification.body}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="h-1 bg-white/30">
        <div 
          className="h-full bg-white/50 animate-[shrink_5s_linear]"
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
  return (
    <>
      {notifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${(index * 120) + 16}px` }} className="fixed right-0">
          <CustomNotification notification={notification} onClose={onClose} />
        </div>
      ))}
    </>
  );
};
