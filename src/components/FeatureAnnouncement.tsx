import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ANNOUNCEMENT_KEY = 'lighterdash-ai-insights-announced-v2';

export function FeatureAnnouncement() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!hasSeenAnnouncement) {
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    setIsOpen(false);
  };

  const handleTryNow = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    setIsOpen(false);
    navigate('/trade-analyzer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md overflow-hidden p-0 rounded-2xl">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary-glow to-purple-600 p-4 sm:p-8 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm mb-3 sm:mb-4 animate-in zoom-in-50 duration-500">
              <SparklesIcon className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-3xl font-medium text-white mb-1 sm:mb-2">
                New Feature: AI Trader Insights
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm sm:text-base font-medium">
                Unlock the power of AI to analyze your trading patterns!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Upload your trade history CSV and get instant AI-powered analysis with personalized recommendations to improve your trading performance.
            </p>
          </div>

          {/* Features List */}
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-3">What you get:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">Pattern recognition for winning & losing setups</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">Performance breakdown by time & market</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">Personalized tips to improve win rate</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">Detection of overtrading & harmful patterns</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 font-medium"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleTryNow}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 font-medium"
            >
              <SparklesIcon className="w-4 h-4" />
              Try It Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}