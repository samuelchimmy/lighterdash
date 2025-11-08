import { useEffect, useState, useRef } from 'react';
import type { UserStats, Position } from '@/types/lighter';
import { checkAlerts, type Alert, type AlertConfig, DEFAULT_ALERT_CONFIG } from '@/lib/alert-utils';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, TrendingUp, Activity, Zap } from 'lucide-react';

interface AlertMonitorProps {
  stats: UserStats | null;
  positions: Position[];
  currentPnL: number;
}

export const AlertMonitor = ({ stats, positions, currentPnL }: AlertMonitorProps) => {
  const { toast } = useToast();
  const [alertConfig] = useState<AlertConfig>(DEFAULT_ALERT_CONFIG);
  const previousPnLRef = useRef(currentPnL);
  const shownAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const alerts = checkAlerts(
      stats,
      positions,
      previousPnLRef.current,
      currentPnL,
      alertConfig
    );

    alerts.forEach(alert => {
      // Avoid showing the same alert multiple times
      if (shownAlertsRef.current.has(alert.id)) return;
      shownAlertsRef.current.add(alert.id);

      const icon = alert.type === 'margin' ? <Activity className="w-4 h-4" /> :
                   alert.type === 'pnl' ? <TrendingUp className="w-4 h-4" /> :
                   alert.type === 'liquidation' ? <AlertTriangle className="w-4 h-4" /> :
                   <Zap className="w-4 h-4" />;

      toast({
        title: alert.title,
        description: alert.description,
        variant: alert.severity === 'error' ? 'destructive' : 'default',
      });
    });

    previousPnLRef.current = currentPnL;
    
    // Clean up old alerts from the set periodically
    if (shownAlertsRef.current.size > 50) {
      shownAlertsRef.current.clear();
    }
  }, [stats, positions, currentPnL, alertConfig, toast]);

  return null; // This is a monitoring component, no UI
};
