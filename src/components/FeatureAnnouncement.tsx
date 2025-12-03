import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const ANNOUNCEMENT_KEY = 'lighterdash-ai-insights-announced';

export function FeatureAnnouncement() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem(ANNOUNCEMENT_KEY);
    
    if (!hasSeenAnnouncement) {
      const timer = setTimeout(() => {
        toast(
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">New Feature: AI Trader Insights</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your trade history and get AI-powered analytics and recommendations!
              </p>
              <button
                onClick={() => {
                  navigate('/trade-analyzer');
                  toast.dismiss();
                }}
                className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Try it now →
              </button>
            </div>
          </div>,
          {
            duration: 10000,
            position: 'bottom-right',
            className: 'bg-card border border-border shadow-lg',
          }
        );
        
        localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return null;
}
