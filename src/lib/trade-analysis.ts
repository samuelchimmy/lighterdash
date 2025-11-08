import type { LighterTrade } from '@/types/lighter';

export interface TradeWithPnL extends LighterTrade {
  pnl: number;
  isWin: boolean;
}

export interface StreakInfo {
  type: 'win' | 'loss';
  count: number;
  startDate: Date;
  endDate: Date;
  totalPnL: number;
}

export interface EntryPattern {
  hour: number;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPnL: number;
}

export interface DayPattern {
  day: number; // 0-6 (Sunday-Saturday)
  dayName: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPnL: number;
}

export const calculateTradePnL = (trade: LighterTrade, accountId?: number): TradeWithPnL => {
  // Calculate PnL based on position changes if available
  const size = parseFloat(trade.size);
  const price = parseFloat(trade.price);
  const fee = (trade.taker_fee || trade.maker_fee || 0);
  
  // Estimate PnL from position changes
  let pnl = 0;
  if (trade.taker_position_size_before !== undefined && trade.taker_entry_quote_before !== undefined) {
    const positionBefore = parseFloat(trade.taker_position_size_before);
    const entryQuoteBefore = parseFloat(trade.taker_entry_quote_before);
    if (positionBefore !== 0) {
      const avgEntryPrice = entryQuoteBefore / Math.abs(positionBefore);
      pnl = (price - avgEntryPrice) * size * (positionBefore < 0 ? 1 : -1) - fee;
    }
  } else if (trade.maker_position_size_before !== undefined && trade.maker_entry_quote_before !== undefined) {
    const positionBefore = parseFloat(trade.maker_position_size_before);
    const entryQuoteBefore = parseFloat(trade.maker_entry_quote_before);
    if (positionBefore !== 0) {
      const avgEntryPrice = entryQuoteBefore / Math.abs(positionBefore);
      pnl = (price - avgEntryPrice) * size * (positionBefore < 0 ? 1 : -1) - fee;
    }
  }

  return {
    ...trade,
    pnl,
    isWin: pnl > 0,
  };
};

export const findStreaks = (trades: TradeWithPnL[]): StreakInfo[] => {
  if (trades.length === 0) return [];

  const streaks: StreakInfo[] = [];
  let currentStreak: StreakInfo | null = null;

  // Sort by timestamp
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  sortedTrades.forEach(trade => {
    const tradeDate = new Date(trade.timestamp * 1000);
    
    if (!currentStreak) {
      currentStreak = {
        type: trade.isWin ? 'win' : 'loss',
        count: 1,
        startDate: tradeDate,
        endDate: tradeDate,
        totalPnL: trade.pnl,
      };
    } else if ((currentStreak.type === 'win') === trade.isWin) {
      // Continue streak
      currentStreak.count++;
      currentStreak.endDate = tradeDate;
      currentStreak.totalPnL += trade.pnl;
    } else {
      // End current streak, start new one
      streaks.push(currentStreak);
      currentStreak = {
        type: trade.isWin ? 'win' : 'loss',
        count: 1,
        startDate: tradeDate,
        endDate: tradeDate,
        totalPnL: trade.pnl,
      };
    }
  });

  if (currentStreak) {
    streaks.push(currentStreak);
  }

  return streaks;
};

export const analyzeEntryPatterns = (trades: TradeWithPnL[]): EntryPattern[] => {
  const hourlyData = new Map<number, { wins: number; losses: number; totalPnL: number }>();

  trades.forEach(trade => {
    const hour = new Date(trade.timestamp * 1000).getHours();
    const data = hourlyData.get(hour) || { wins: 0, losses: 0, totalPnL: 0 };
    
    if (trade.isWin) {
      data.wins++;
    } else {
      data.losses++;
    }
    data.totalPnL += trade.pnl;
    
    hourlyData.set(hour, data);
  });

  const patterns: EntryPattern[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData.get(hour) || { wins: 0, losses: 0, totalPnL: 0 };
    const count = data.wins + data.losses;
    
    patterns.push({
      hour,
      count,
      wins: data.wins,
      losses: data.losses,
      winRate: count > 0 ? (data.wins / count) * 100 : 0,
      avgPnL: count > 0 ? data.totalPnL / count : 0,
    });
  }

  return patterns;
};

export const analyzeDayPatterns = (trades: TradeWithPnL[]): DayPattern[] => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyData = new Map<number, { wins: number; losses: number; totalPnL: number }>();

  trades.forEach(trade => {
    const day = new Date(trade.timestamp * 1000).getDay();
    const data = dailyData.get(day) || { wins: 0, losses: 0, totalPnL: 0 };
    
    if (trade.isWin) {
      data.wins++;
    } else {
      data.losses++;
    }
    data.totalPnL += trade.pnl;
    
    dailyData.set(day, data);
  });

  const patterns: DayPattern[] = [];
  for (let day = 0; day < 7; day++) {
    const data = dailyData.get(day) || { wins: 0, losses: 0, totalPnL: 0 };
    const count = data.wins + data.losses;
    
    patterns.push({
      day,
      dayName: dayNames[day],
      count,
      wins: data.wins,
      losses: data.losses,
      winRate: count > 0 ? (data.wins / count) * 100 : 0,
      avgPnL: count > 0 ? data.totalPnL / count : 0,
    });
  }

  return patterns;
};
