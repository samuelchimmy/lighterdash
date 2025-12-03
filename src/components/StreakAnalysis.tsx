import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { LighterTrade } from "@/types/lighter";
import { formatCurrency } from "@/lib/lighter-api";
import { calculateTradePnL, findStreaks } from "@/lib/trade-analysis";

interface StreakAnalysisProps {
  trades: LighterTrade[];
  accountId?: number;
}

export function StreakAnalysis({ trades, accountId }: StreakAnalysisProps) {
  const { longestWinStreak, longestLossStreak, currentStreak } = useMemo(() => {
    const tradesWithPnl = trades.map(t => calculateTradePnL(t, accountId));
    const streaks = findStreaks(tradesWithPnl);
    
    const winStreaks = streaks.filter(s => s.type === 'win').sort((a, b) => b.count - a.count);
    const lossStreaks = streaks.filter(s => s.type === 'loss').sort((a, b) => b.count - a.count);
    
    // Determine current streak
    let current = null;
    if (tradesWithPnl.length > 0) {
      const recentTrades = tradesWithPnl.slice(0, 10);
      let count = 0;
      const firstType = recentTrades[0].isWin ? 'win' : 'loss';
      
      for (const trade of recentTrades) {
        if ((firstType === 'win' && trade.isWin) || (firstType === 'loss' && !trade.isWin)) {
          count++;
        } else {
          break;
        }
      }
      
      if (count > 0) {
        current = { type: firstType, count };
      }
    }

    return {
      longestWinStreak: winStreaks[0] || null,
      longestLossStreak: lossStreaks[0] || null,
      currentStreak: current,
    };
  }, [trades, accountId]);

  if (trades.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
          <h3 className="text-lg font-semibold text-foreground">Win/Loss Streaks</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No trading data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" fill="currentColor" fillOpacity={0.2} />
        <h3 className="text-lg font-semibold text-foreground">Win/Loss Streaks</h3>
      </div>
      <div className="space-y-4">
        {/* Current Streak */}
        {currentStreak && (
          <div className={`p-4 rounded-xl border-2 ${
            currentStreak.type === 'win' 
              ? 'bg-profit/10 border-profit/30' 
              : 'bg-loss/10 border-loss/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Current Streak</span>
              <Badge variant={currentStreak.type === 'win' ? 'default' : 'destructive'}>
                {currentStreak.type === 'win' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {currentStreak.type.toUpperCase()}
              </Badge>
            </div>
            <p className={`text-3xl font-bold ${currentStreak.type === 'win' ? 'text-profit' : 'text-loss'}`}>
              {currentStreak.count} {currentStreak.count === 1 ? 'trade' : 'trades'}
            </p>
          </div>
        )}

        {/* Longest Win Streak */}
        {longestWinStreak && (
          <div className="p-4 border border-border/50 rounded-lg bg-secondary/30 space-y-2 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-profit" />
                Longest Win Streak
              </h4>
              <Badge variant="default">{longestWinStreak.count} wins</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total PnL</p>
                <p className="font-bold text-profit">+{formatCurrency(longestWinStreak.totalPnL)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="font-medium text-muted-foreground text-xs">
                  {new Date(longestWinStreak.startDate).toLocaleDateString()} - {new Date(longestWinStreak.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Longest Loss Streak */}
        {longestLossStreak && (
          <div className="p-4 border border-border/50 rounded-lg bg-secondary/30 space-y-2 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                <TrendingDown className="h-4 w-4 text-loss" />
                Longest Loss Streak
              </h4>
              <Badge variant="destructive">{longestLossStreak.count} losses</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total PnL</p>
                <p className="font-bold text-loss">{formatCurrency(longestLossStreak.totalPnL)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="font-medium text-muted-foreground text-xs">
                  {new Date(longestLossStreak.startDate).toLocaleDateString()} - {new Date(longestLossStreak.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {!longestWinStreak && !longestLossStreak && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Need more trading data to analyze streaks
          </p>
        )}
      </div>
    </Card>
  );
}
