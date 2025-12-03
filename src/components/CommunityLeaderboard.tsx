import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/lighter-api";

interface LeaderboardEntry {
  wallet_address: string;
  display_name: string | null;
  total_pnl: number;
  win_rate: number | null;
  total_trades: number;
  total_volume: number;
  rank: number | null;
  is_public: boolean;
}

export function CommunityLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "all">("all");

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("*")
      .eq("is_public", true)
      .order("total_pnl", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to load leaderboard");
      return;
    }

    setEntries(data || []);
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 border-gray-400/20";
    if (rank === 3) return "bg-orange-600/10 border-orange-600/20";
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" fill="currentColor" fillOpacity={0.2} />
            Community Leaderboard
          </CardTitle>
          <div className="flex gap-2">
            {(["day", "week", "month", "all"] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf === "all" ? "All Time" : tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.wallet_address}
              className={`p-4 border rounded-lg transition-all hover:shadow-md ${getRankColor(index + 1)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold w-12 text-center">
                    {getRankEmoji(index + 1)}
                  </span>
                  <div>
                    <h4 className="font-semibold">
                      {entry.display_name || `Trader ${entry.wallet_address.slice(0, 6)}...`}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {entry.wallet_address.slice(0, 10)}...{entry.wallet_address.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {entry.total_pnl > 10000 && (
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" fill="currentColor" fillOpacity={0.2} />
                      High Roller
                    </Badge>
                  )}
                  {(entry.win_rate || 0) > 70 && (
                    <Badge variant="secondary">
                      <Target className="w-3 h-3 mr-1" fill="currentColor" fillOpacity={0.2} />
                      Sharpshooter
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Total PnL</p>
                  <p className={`font-bold text-lg ${entry.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(entry.total_pnl)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="font-bold text-lg">{formatPercentage(entry.win_rate || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Trades</p>
                  <p className="font-bold text-lg">{formatNumber(entry.total_trades)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-bold text-lg">{formatCurrency(entry.total_volume)}</p>
                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" fillOpacity={0.2} />
              <p>No leaderboard entries yet</p>
              <p className="text-sm mt-2">Be the first to join!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
