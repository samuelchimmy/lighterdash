interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'profit' | 'achievement';
  achieved: boolean;
  achievedAt?: number;
}

interface TradeStats {
  consecutiveWins: number;
  consecutiveLosses: number;
  profitableTradesToday: number;
  totalTradesToday: number;
  previousPnL: number;
  currentPnL: number;
  highestStreak: number;
}

class AchievementTracker {
  private storageKey = 'lighterdash-achievements';
  private achievements = new Map<string, Achievement>();
  private stats: TradeStats = {
    consecutiveWins: 0,
    consecutiveLosses: 0,
    profitableTradesToday: 0,
    totalTradesToday: 0,
    previousPnL: 0,
    currentPnL: 0,
    highestStreak: 0,
  };

  constructor() {
    this.loadAchievements();
  }

  private loadAchievements(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.achievements = new Map(Object.entries(data.achievements || {}));
        this.stats = data.stats || this.stats;
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }

  private saveAchievements(): void {
    try {
      const data = {
        achievements: Object.fromEntries(this.achievements),
        stats: this.stats,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  private markAchieved(id: string, name: string, description: string, type: Achievement['type']): boolean {
    const existing = this.achievements.get(id);
    if (existing?.achieved) {
      return false; // Already achieved
    }

    this.achievements.set(id, {
      id,
      name,
      description,
      type,
      achieved: true,
      achievedAt: Date.now(),
    });
    this.saveAchievements();
    return true; // Newly achieved
  }

  updatePnL(currentPnL: number): Achievement | null {
    const previousPnL = this.stats.currentPnL;
    this.stats.previousPnL = previousPnL;
    this.stats.currentPnL = currentPnL;

    // Check for breaking even after losses
    if (previousPnL < 0 && currentPnL >= 0) {
      const achieved = this.markAchieved(
        'break-even',
        'Breaking Even!',
        'Recovered from losses',
        'achievement'
      );
      if (achieved) {
        this.saveAchievements();
        return this.achievements.get('break-even')!;
      }
    }

    // Check for profit milestones (already handled in Dashboard)
    return null;
  }

  updateTradeResult(isProfitable: boolean, tradeDate: Date = new Date()): Achievement | null {
    // Check if it's a new day
    const today = new Date().toDateString();
    const lastTradeDay = localStorage.getItem('lighterdash-last-trade-day');
    
    if (lastTradeDay !== today) {
      // Reset daily stats
      this.stats.profitableTradesToday = 0;
      this.stats.totalTradesToday = 0;
      localStorage.setItem('lighterdash-last-trade-day', today);
    }

    this.stats.totalTradesToday++;

    if (isProfitable) {
      this.stats.profitableTradesToday++;
      this.stats.consecutiveWins++;
      this.stats.consecutiveLosses = 0;

      // Update highest streak
      if (this.stats.consecutiveWins > this.stats.highestStreak) {
        this.stats.highestStreak = this.stats.consecutiveWins;
      }

      // Check for win streaks
      if (this.stats.consecutiveWins === 3) {
        const achieved = this.markAchieved(
          'win-streak-3',
          '3-Trade Win Streak!',
          'Three profitable trades in a row',
          'achievement'
        );
        if (achieved) {
          this.saveAchievements();
          return this.achievements.get('win-streak-3')!;
        }
      } else if (this.stats.consecutiveWins === 5) {
        const achieved = this.markAchieved(
          'win-streak-5',
          '5-Trade Win Streak!',
          'Five profitable trades in a row - impressive!',
          'achievement'
        );
        if (achieved) {
          this.saveAchievements();
          return this.achievements.get('win-streak-5')!;
        }
      } else if (this.stats.consecutiveWins === 10) {
        const achieved = this.markAchieved(
          'win-streak-10',
          '10-Trade Win Streak!',
          'Ten profitable trades in a row - you\'re on fire! 🔥',
          'achievement'
        );
        if (achieved) {
          this.saveAchievements();
          return this.achievements.get('win-streak-10')!;
        }
      }
    } else {
      this.stats.consecutiveLosses++;
      this.stats.consecutiveWins = 0;
    }

    // Check for perfect trading day
    if (this.stats.totalTradesToday >= 5 && this.stats.profitableTradesToday === this.stats.totalTradesToday) {
      const achieved = this.markAchieved(
        `perfect-day-${today}`,
        'Perfect Trading Day!',
        `${this.stats.totalTradesToday} trades, all profitable!`,
        'milestone'
      );
      if (achieved) {
        this.saveAchievements();
        return this.achievements.get(`perfect-day-${today}`)!;
      }
    }

    this.saveAchievements();
    return null;
  }

  getStats(): TradeStats {
    return { ...this.stats };
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).sort((a, b) => {
      return (b.achievedAt || 0) - (a.achievedAt || 0);
    });
  }

  getRecentAchievements(limit = 5): Achievement[] {
    return this.getAllAchievements()
      .filter(a => a.achieved)
      .slice(0, limit);
  }

  reset(): void {
    this.achievements.clear();
    this.stats = {
      consecutiveWins: 0,
      consecutiveLosses: 0,
      profitableTradesToday: 0,
      totalTradesToday: 0,
      previousPnL: 0,
      currentPnL: 0,
      highestStreak: 0,
    };
    this.saveAchievements();
  }
}

export const achievementTracker = new AchievementTracker();
export type { Achievement, TradeStats };
