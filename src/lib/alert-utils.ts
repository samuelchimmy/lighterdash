import type { UserStats, Position } from '@/types/lighter';

export interface AlertConfig {
  lowMarginThreshold: number;
  highMarginThreshold: number;
  pnlChangeThreshold: number;
  notifyOnLiquidation: boolean;
  notifyOnLargePnL: boolean;
  notifyOnLowMargin: boolean;
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  lowMarginThreshold: 0.2,
  highMarginThreshold: 0.8,
  pnlChangeThreshold: 100,
  notifyOnLiquidation: true,
  notifyOnLargePnL: true,
  notifyOnLowMargin: true,
};

export type AlertType = 'margin' | 'pnl' | 'liquidation' | 'position';

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: number;
}

export const checkAlerts = (
  stats: UserStats | null,
  positions: Position[],
  previousPnL: number,
  currentPnL: number,
  config: AlertConfig
): Alert[] => {
  const alerts: Alert[] = [];
  
  if (!stats) return alerts;

  const marginUsage = parseFloat(stats.margin_usage || '0');
  const pnlChange = Math.abs(currentPnL - previousPnL);
  
  // Low margin alert
  if (config.notifyOnLowMargin && marginUsage < config.lowMarginThreshold) {
    alerts.push({
      id: `margin-low-${Date.now()}`,
      type: 'margin',
      severity: 'warning',
      title: 'Low Margin Usage',
      description: `Your margin usage is at ${(marginUsage * 100).toFixed(1)}%, which is below the ${(config.lowMarginThreshold * 100)}% threshold.`,
      timestamp: Date.now(),
    });
  }
  
  // High margin alert
  if (config.notifyOnLowMargin && marginUsage > config.highMarginThreshold) {
    alerts.push({
      id: `margin-high-${Date.now()}`,
      type: 'margin',
      severity: 'error',
      title: 'High Margin Usage - Risk Warning',
      description: `Your margin usage is at ${(marginUsage * 100).toFixed(1)}%, which is above the ${(config.highMarginThreshold * 100)}% threshold. Consider reducing leverage.`,
      timestamp: Date.now(),
    });
  }
  
  // Large PnL change alert
  if (config.notifyOnLargePnL && pnlChange > config.pnlChangeThreshold) {
    alerts.push({
      id: `pnl-change-${Date.now()}`,
      type: 'pnl',
      severity: currentPnL > previousPnL ? 'info' : 'warning',
      title: 'Significant PnL Change',
      description: `Your PnL has changed by $${pnlChange.toFixed(2)} (${currentPnL > previousPnL ? 'gain' : 'loss'}).`,
      timestamp: Date.now(),
    });
  }
  
  // Check for positions close to liquidation
  if (config.notifyOnLiquidation) {
    positions.forEach(position => {
      const liqPrice = parseFloat(position.liquidation_price || '0');
      const entryPrice = parseFloat(position.avg_entry_price || '0');
      
      if (liqPrice > 0 && entryPrice > 0) {
        const distance = Math.abs((liqPrice - entryPrice) / entryPrice);
        
        if (distance < 0.1) { // Within 10% of liquidation
          alerts.push({
            id: `liquidation-${position.symbol}-${Date.now()}`,
            type: 'liquidation',
            severity: 'error',
            title: `${position.symbol} Near Liquidation`,
            description: `Your ${position.symbol} position is within 10% of liquidation price ($${liqPrice.toFixed(2)}).`,
            timestamp: Date.now(),
          });
        }
      }
    });
  }
  
  return alerts;
};
