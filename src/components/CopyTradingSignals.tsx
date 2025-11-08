import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Users, Award, Eye } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/lighter-api";

interface CopySignal {
  id: string;
  provider_wallet: string;
  provider_name: string | null;
  total_followers: number;
  win_rate: number | null;
  total_pnl: number | null;
  avg_trade_size: number | null;
  is_public: boolean;
}

export function CopyTradingSignals() {
  const [signals, setSignals] = useState<CopySignal[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    const { data, error } = await supabase
      .from("copy_trading_signals")
      .select("*")
      .eq("is_public", true)
      .order("total_pnl", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Failed to load signals");
      return;
    }

    setSignals(data || []);
  };

  const toggleFollow = async (signalId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to follow traders");
      return;
    }

    const isFollowing = following.has(signalId);
    const signal = signals.find(s => s.id === signalId);
    
    if (!signal) return;

    const newFollowers = isFollowing ? signal.total_followers - 1 : signal.total_followers + 1;

    const { error } = await supabase
      .from("copy_trading_signals")
      .update({ total_followers: newFollowers })
      .eq("id", signalId);

    if (error) {
      toast.error("Failed to update follow status");
      return;
    }

    if (isFollowing) {
      following.delete(signalId);
      toast.success("Unfollowed trader");
    } else {
      following.add(signalId);
      toast.success("Now following trader");
    }

    setFollowing(new Set(following));
    loadSignals();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 Top Trader</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">🥈 2nd Place</Badge>;
    if (index === 2) return <Badge className="bg-orange-600">🥉 3rd Place</Badge>;
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Copy Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Follow the best traders and get notified of their trades
          </p>

          <div className="space-y-3">
            {signals.map((signal, index) => (
              <Card key={signal.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {signal.provider_name || `Trader ${signal.provider_wallet.slice(0, 6)}...`}
                      </h4>
                      {getRankBadge(index)}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {signal.provider_wallet.slice(0, 10)}...{signal.provider_wallet.slice(-8)}
                    </p>
                  </div>
                  <Button
                    variant={following.has(signal.id) ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleFollow(signal.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {following.has(signal.id) ? "Following" : "Follow"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total PnL</p>
                    <p className={`font-bold ${(signal.total_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(signal.total_pnl || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="font-bold">{formatPercentage(signal.win_rate || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Trade</p>
                    <p className="font-bold">{formatCurrency(signal.avg_trade_size || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="font-bold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {signal.total_followers}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {signals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No signals available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
