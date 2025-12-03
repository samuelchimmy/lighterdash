import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ANNOUNCEMENT_KEY = 'lighterdash-ai-insights-announced-v2';

export function FeatureAnnouncement() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!hasSeenAnnouncement) {
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    setIsVisible(false);
  };

  const handleTryNow = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    setIsVisible(false);
    navigate('/trade-analyzer');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[90vw] sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary-glow to-purple-600 p-4 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
          
          <div className="relative flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm animate-in zoom-in-50 duration-500">
              <LightBulbIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-medium text-white">
                New: AI Trader Insights
              </h3>
              <p className="text-white/80 text-xs font-medium">
                Analyze your trading patterns with AI
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Upload your trade history and get AI-powered analysis with personalized recommendations.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="flex-1 font-medium text-xs"
            >
              Later
            </Button>
            <Button
              onClick={handleTryNow}
              size="sm"
              className="flex-1 gap-1.5 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 font-medium text-xs"
            >
              <LightBulbIcon className="w-3.5 h-3.5" />
              Try It Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}