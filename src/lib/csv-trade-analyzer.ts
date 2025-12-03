// CSV Trade Analyzer Utilities

export interface CSVTrade {
  date: Date;
  market: string;
  side: 'Long' | 'Short';
  size: number;
  price: number;
  closedPnL: number;
  fee: number;
  role: 'Maker' | 'Taker';
  type: 'Limit' | 'Market';
}

export interface KPIMetrics {
  netPnL: number;
  totalFees: number;
  grossProfit: number;
  grossLoss: number;
  winRate: number;
  profitFactor: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  payoffRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export interface SideAnalysis {
  long: { pnl: number; winRate: number; profitFactor: number; trades: number };
  short: { pnl: number; winRate: number; profitFactor: number; trades: number };
}

export interface RoleAnalysis {
  maker: { pnl: number; winRate: number; trades: number };
  taker: { pnl: number; winRate: number; trades: number };
}

export interface TypeAnalysis {
  limit: { pnl: number; winRate: number; trades: number };
  market: { pnl: number; winRate: number; trades: number };
}

export interface HourlyPattern {
  hour: number;
  pnl: number;
  winRate: number;
  trades: number;
}

export interface DailyPattern {
  day: string;
  dayIndex: number;
  pnl: number;
  winRate: number;
  trades: number;
}

export interface MarketBreakdown {
  market: string;
  netPnL: number;
  winRate: number;
  profitFactor: number;
  totalFees: number;
  totalTrades: number;
  avgPnLPerTrade: number;
}

export interface CumulativePnLPoint {
  date: Date;
  pnl: number;
  dateStr: string;
}

export interface AnalysisResult {
  kpis: KPIMetrics;
  sideAnalysis: SideAnalysis;
  roleAnalysis: RoleAnalysis;
  typeAnalysis: TypeAnalysis;
  hourlyPatterns: HourlyPattern[];
  dailyPatterns: DailyPattern[];
  marketBreakdown: MarketBreakdown[];
  cumulativePnL: CumulativePnLPoint[];
  periodPnL: { period: string; pnl: number }[];
}

// Parse CSV row to CSVTrade object
export function parseCSVRow(row: Record<string, string>): CSVTrade | null {
  try {
    const dateStr = row['Date'] || row['date'] || row['Timestamp'] || row['timestamp'];
    const market = row['Market'] || row['market'] || row['Symbol'] || row['symbol'];
    const sideRaw = (row['Side'] || row['side'] || '').toLowerCase();
    const sizeStr = row['Size'] || row['size'] || row['Quantity'] || row['quantity'];
    const priceStr = row['Price'] || row['price'];
    const pnlStr = row['Closed PnL'] || row['closed_pnl'] || row['PnL'] || row['pnl'] || row['Realized PnL'];
    const feeStr = row['Fee'] || row['fee'] || row['Fees'] || row['fees'] || '0';
    const roleRaw = (row['Role'] || row['role'] || 'taker').toLowerCase();
    const typeRaw = (row['Type'] || row['type'] || row['Order Type'] || 'market').toLowerCase();

    if (!dateStr || !market || !pnlStr) return null;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const side: 'Long' | 'Short' = sideRaw.includes('long') || sideRaw.includes('buy') ? 'Long' : 'Short';
    const role: 'Maker' | 'Taker' = roleRaw.includes('maker') ? 'Maker' : 'Taker';
    const type: 'Limit' | 'Market' = typeRaw.includes('limit') ? 'Limit' : 'Market';

    return {
      date,
      market: market.toUpperCase(),
      side,
      size: parseFloat(sizeStr) || 0,
      price: parseFloat(priceStr) || 0,
      closedPnL: parseFloat(pnlStr) || 0,
      fee: Math.abs(parseFloat(feeStr)) || 0,
      role,
      type,
    };
  } catch {
    return null;
  }
}

// Calculate KPI metrics
export function calculateKPIs(trades: CSVTrade[]): KPIMetrics {
  if (trades.length === 0) {
    return {
      netPnL: 0, totalFees: 0, grossProfit: 0, grossLoss: 0,
      winRate: 0, profitFactor: 0, avgWinningTrade: 0, avgLosingTrade: 0,
      payoffRatio: 0, totalTrades: 0, winningTrades: 0, losingTrades: 0
    };
  }

  const netPnL = trades.reduce((sum, t) => sum + t.closedPnL, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);
  
  const winningTrades = trades.filter(t => t.closedPnL > 0);
  const losingTrades = trades.filter(t => t.closedPnL < 0);
  
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.closedPnL, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.closedPnL, 0));
  
  const winRate = (winningTrades.length / trades.length) * 100;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  
  const avgWinningTrade = winningTrades.length > 0 
    ? grossProfit / winningTrades.length : 0;
  const avgLosingTrade = losingTrades.length > 0 
    ? grossLoss / losingTrades.length : 0;
  
  const payoffRatio = avgLosingTrade > 0 ? avgWinningTrade / avgLosingTrade : avgWinningTrade > 0 ? Infinity : 0;

  return {
    netPnL,
    totalFees,
    grossProfit,
    grossLoss,
    winRate,
    profitFactor,
    avgWinningTrade,
    avgLosingTrade,
    payoffRatio,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length
  };
}

// Analyze by side (Long vs Short)
export function analyzeBySide(trades: CSVTrade[]): SideAnalysis {
  const longTrades = trades.filter(t => t.side === 'Long');
  const shortTrades = trades.filter(t => t.side === 'Short');

  const analyzeGroup = (group: CSVTrade[]) => {
    if (group.length === 0) return { pnl: 0, winRate: 0, profitFactor: 0, trades: 0 };
    const pnl = group.reduce((sum, t) => sum + t.closedPnL, 0);
    const wins = group.filter(t => t.closedPnL > 0);
    const losses = group.filter(t => t.closedPnL < 0);
    const grossProfit = wins.reduce((sum, t) => sum + t.closedPnL, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.closedPnL, 0));
    return {
      pnl,
      winRate: (wins.length / group.length) * 100,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      trades: group.length
    };
  };

  return {
    long: analyzeGroup(longTrades),
    short: analyzeGroup(shortTrades)
  };
}

// Analyze by role (Maker vs Taker)
export function analyzeByRole(trades: CSVTrade[]): RoleAnalysis {
  const makerTrades = trades.filter(t => t.role === 'Maker');
  const takerTrades = trades.filter(t => t.role === 'Taker');

  const analyzeGroup = (group: CSVTrade[]) => {
    if (group.length === 0) return { pnl: 0, winRate: 0, trades: 0 };
    const pnl = group.reduce((sum, t) => sum + t.closedPnL, 0);
    const wins = group.filter(t => t.closedPnL > 0);
    return {
      pnl,
      winRate: (wins.length / group.length) * 100,
      trades: group.length
    };
  };

  return {
    maker: analyzeGroup(makerTrades),
    taker: analyzeGroup(takerTrades)
  };
}

// Analyze by order type (Limit vs Market)
export function analyzeByType(trades: CSVTrade[]): TypeAnalysis {
  const limitTrades = trades.filter(t => t.type === 'Limit');
  const marketTrades = trades.filter(t => t.type === 'Market');

  const analyzeGroup = (group: CSVTrade[]) => {
    if (group.length === 0) return { pnl: 0, winRate: 0, trades: 0 };
    const pnl = group.reduce((sum, t) => sum + t.closedPnL, 0);
    const wins = group.filter(t => t.closedPnL > 0);
    return {
      pnl,
      winRate: (wins.length / group.length) * 100,
      trades: group.length
    };
  };

  return {
    limit: analyzeGroup(limitTrades),
    market: analyzeGroup(marketTrades)
  };
}

// Analyze hourly patterns
export function analyzeHourlyPatterns(trades: CSVTrade[]): HourlyPattern[] {
  const hourlyMap = new Map<number, CSVTrade[]>();
  
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, []);
  }
  
  trades.forEach(trade => {
    const hour = trade.date.getHours();
    hourlyMap.get(hour)?.push(trade);
  });

  return Array.from(hourlyMap.entries()).map(([hour, hourTrades]) => {
    if (hourTrades.length === 0) {
      return { hour, pnl: 0, winRate: 0, trades: 0 };
    }
    const pnl = hourTrades.reduce((sum, t) => sum + t.closedPnL, 0);
    const wins = hourTrades.filter(t => t.closedPnL > 0);
    return {
      hour,
      pnl,
      winRate: (wins.length / hourTrades.length) * 100,
      trades: hourTrades.length
    };
  });
}

// Analyze daily patterns (day of week)
export function analyzeDailyPatterns(trades: CSVTrade[]): DailyPattern[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyMap = new Map<number, CSVTrade[]>();
  
  for (let i = 0; i < 7; i++) {
    dailyMap.set(i, []);
  }
  
  trades.forEach(trade => {
    const day = trade.date.getDay();
    dailyMap.get(day)?.push(trade);
  });

  return Array.from(dailyMap.entries()).map(([dayIndex, dayTrades]) => {
    if (dayTrades.length === 0) {
      return { day: days[dayIndex], dayIndex, pnl: 0, winRate: 0, trades: 0 };
    }
    const pnl = dayTrades.reduce((sum, t) => sum + t.closedPnL, 0);
    const wins = dayTrades.filter(t => t.closedPnL > 0);
    return {
      day: days[dayIndex],
      dayIndex,
      pnl,
      winRate: (wins.length / dayTrades.length) * 100,
      trades: dayTrades.length
    };
  });
}

// Analyze by market
export function analyzeByMarket(trades: CSVTrade[]): MarketBreakdown[] {
  const marketMap = new Map<string, CSVTrade[]>();
  
  trades.forEach(trade => {
    const existing = marketMap.get(trade.market) || [];
    existing.push(trade);
    marketMap.set(trade.market, existing);
  });

  return Array.from(marketMap.entries()).map(([market, marketTrades]) => {
    const netPnL = marketTrades.reduce((sum, t) => sum + t.closedPnL, 0);
    const totalFees = marketTrades.reduce((sum, t) => sum + t.fee, 0);
    const wins = marketTrades.filter(t => t.closedPnL > 0);
    const losses = marketTrades.filter(t => t.closedPnL < 0);
    const grossProfit = wins.reduce((sum, t) => sum + t.closedPnL, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.closedPnL, 0));
    
    return {
      market,
      netPnL,
      winRate: (wins.length / marketTrades.length) * 100,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      totalFees,
      totalTrades: marketTrades.length,
      avgPnLPerTrade: netPnL / marketTrades.length
    };
  }).sort((a, b) => b.netPnL - a.netPnL);
}

// Calculate cumulative PnL over time
export function calculateCumulativePnL(trades: CSVTrade[]): CumulativePnLPoint[] {
  const sortedTrades = [...trades].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let cumulative = 0;
  return sortedTrades.map(trade => {
    cumulative += trade.closedPnL;
    return {
      date: trade.date,
      pnl: cumulative,
      dateStr: trade.date.toLocaleDateString()
    };
  });
}

// Calculate PnL by period (daily/weekly)
export function calculatePeriodPnL(trades: CSVTrade[], period: 'daily' | 'weekly' = 'daily'): { period: string; pnl: number }[] {
  const periodMap = new Map<string, number>();
  
  trades.forEach(trade => {
    let key: string;
    if (period === 'daily') {
      key = trade.date.toLocaleDateString();
    } else {
      // Get week start (Sunday)
      const d = new Date(trade.date);
      d.setDate(d.getDate() - d.getDay());
      key = `Week of ${d.toLocaleDateString()}`;
    }
    periodMap.set(key, (periodMap.get(key) || 0) + trade.closedPnL);
  });

  return Array.from(periodMap.entries())
    .map(([period, pnl]) => ({ period, pnl }))
    .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
}

// Full analysis
export function analyzeAllTrades(trades: CSVTrade[]): AnalysisResult {
  return {
    kpis: calculateKPIs(trades),
    sideAnalysis: analyzeBySide(trades),
    roleAnalysis: analyzeByRole(trades),
    typeAnalysis: analyzeByType(trades),
    hourlyPatterns: analyzeHourlyPatterns(trades),
    dailyPatterns: analyzeDailyPatterns(trades),
    marketBreakdown: analyzeByMarket(trades),
    cumulativePnL: calculateCumulativePnL(trades),
    periodPnL: calculatePeriodPnL(trades, 'daily')
  };
}
