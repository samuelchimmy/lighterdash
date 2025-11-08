import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'feature' | 'improvement' | 'fix' | 'security';
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2025-01-15',
    type: 'feature',
    changes: [
      'Added keyboard shortcuts for power users (Ctrl+K, Ctrl+E, etc.)',
      'Implemented data caching for faster loading',
      'Added interactive tooltips explaining all metrics',
      'Success animations when reaching milestones',
      'Enhanced export with PDF and shareable images',
      'Virtual scrolling for better performance with large trade lists',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-01-10',
    type: 'improvement',
    changes: [
      'Improved mobile responsiveness across all pages',
      'Updated color scheme - green for profit, red for loss',
      'Added loading skeleton with progress indicators',
      'Removed logo from hero section for cleaner design',
      'Optimized text sizes for better mobile experience',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-01-01',
    type: 'feature',
    changes: [
      'Initial release of LighterDash',
      'Real-time wallet tracking via WebSocket',
      'Live PnL chart with historical data',
      'Position and trade history tables',
      'Market analytics and funding rates',
      'Wallet comparison features',
    ],
  },
];

const STORAGE_KEY = 'lighterdash_last_seen_version';

export const ChangelogModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const latestVersion = CHANGELOG[0].version;

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    if (!lastSeenVersion || lastSeenVersion !== latestVersion) {
      // Show modal after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [latestVersion]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, latestVersion);
    setIsOpen(false);
  };

  const getIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-5 h-5" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5" />;
      case 'fix':
        return <Zap className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
    }
  };

  const getVariant = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature':
        return 'default';
      case 'improvement':
        return 'secondary';
      case 'fix':
        return 'outline';
      case 'security':
        return 'destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl">What's New in LighterDash</DialogTitle>
              <p className="text-sm text-muted-foreground">Latest updates and improvements</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {CHANGELOG.map((entry, index) => (
            <div
              key={entry.version}
              className={`space-y-3 ${index !== 0 ? 'pt-6 border-t border-border' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Badge variant={getVariant(entry.type)} className="gap-1.5">
                  {getIcon(entry.type)}
                  {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                </Badge>
                <span className="font-semibold text-foreground">v{entry.version}</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                {index === 0 && (
                  <Badge variant="outline" className="ml-auto">Latest</Badge>
                )}
              </div>
              <ul className="space-y-2 ml-4">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button onClick={handleClose} className="gap-2">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
