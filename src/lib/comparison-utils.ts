// Simulate market average data for comparison
export interface MarketAverage {
  avgWinRate: number;
  avgLeverage: number;
  avgPositionSize: number;
  avgTradeDuration: number; // in hours
  avgPnLPerTrade: number;
}

export const getMarketAverages = (): MarketAverage => {
  // These are simulated averages for demonstration
  // In a real app, these would come from aggregated user data
  return {
    avgWinRate: 52.5,
    avgLeverage: 3.2,
    avgPositionSize: 150,
    avgTradeDuration: 4.5,
    avgPnLPerTrade: 12.5,
  };
};

export interface PerformanceComparison {
  metric: string;
  userValue: number;
  marketAvg: number;
  percentile: number; // Where user ranks (0-100)
  performance: 'above' | 'below' | 'average';
}

export const comparePerformance = (
  userWinRate: number,
  userLeverage: number,
  userAvgTradeSize: number,
  totalPnL: number,
  totalTrades: number
): PerformanceComparison[] => {
  const marketAvg = getMarketAverages();
  const userPnLPerTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;
  
  const calculatePercentile = (userVal: number, avgVal: number, higherIsBetter: boolean = true): number => {
    const diff = userVal - avgVal;
    const percentDiff = (diff / avgVal) * 100;
    
    if (higherIsBetter) {
      return Math.min(100, Math.max(0, 50 + percentDiff));
    } else {
      return Math.min(100, Math.max(0, 50 - percentDiff));
    }
  };
  
  const getPerformance = (percentile: number): 'above' | 'below' | 'average' => {
    if (percentile > 60) return 'above';
    if (percentile < 40) return 'below';
    return 'average';
  };
  
  const winRatePercentile = calculatePercentile(userWinRate, marketAvg.avgWinRate);
  const leveragePercentile = calculatePercentile(userLeverage, marketAvg.avgLeverage, false); // Lower is better
  const pnlPercentile = calculatePercentile(userPnLPerTrade, marketAvg.avgPnLPerTrade);
  
  return [
    {
      metric: 'Win Rate',
      userValue: userWinRate,
      marketAvg: marketAvg.avgWinRate,
      percentile: winRatePercentile,
      performance: getPerformance(winRatePercentile),
    },
    {
      metric: 'Leverage',
      userValue: userLeverage,
      marketAvg: marketAvg.avgLeverage,
      percentile: leveragePercentile,
      performance: getPerformance(leveragePercentile),
    },
    {
      metric: 'Avg PnL per Trade',
      userValue: userPnLPerTrade,
      marketAvg: marketAvg.avgPnLPerTrade,
      percentile: pnlPercentile,
      performance: getPerformance(pnlPercentile),
    },
  ];
};
