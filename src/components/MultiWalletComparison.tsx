import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardWatermark } from "@/components/ui/card-watermark";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, TrendingDown, Users } from "lucide-react";
import { lighterApi, formatCurrency, formatPercentage } from "@/lib/lighter-api";

interface WalletComparison {
  id: string;
  name: string;
  wallet_addresses: string[];
}

interface WalletMetrics {
  address: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  portfolioValue: number;
}

export function MultiWalletComparison() {
  const [comparisons, setComparisons] = useState<WalletComparison[]>([]);
  const [newName, setNewName] = useState("");
  const [newAddresses, setNewAddresses] = useState("");
  const [metrics, setMetrics] = useState<WalletMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("wallet_comparisons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load comparisons");
      return;
    }

    setComparisons(data || []);
  };

  const addComparison = async () => {
    if (!newName || !newAddresses) {
      toast.error("Please enter a name and wallet addresses");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save comparisons");
      return;
    }

    const addresses = newAddresses.split(",").map(a => a.trim()).filter(Boolean);

    const { error } = await supabase
      .from("wallet_comparisons")
      .insert({
        user_id: user.id,
        name: newName,
        wallet_addresses: addresses
      });

    if (error) {
      toast.error("Failed to save comparison");
      return;
    }

    toast.success("Comparison saved!");
    setNewName("");
    setNewAddresses("");
    loadComparisons();
  };

  const deleteComparison = async (id: string) => {
    const { error } = await supabase
      .from("wallet_comparisons")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete comparison");
      return;
    }

    toast.success("Comparison deleted");
    loadComparisons();
  };

  const loadMetrics = async (addresses: string[]) => {
    setLoading(true);
    const metricsData: WalletMetrics[] = [];

    for (const address of addresses) {
      const accountIndex = await lighterApi.getAccountIndex(address);
      if (accountIndex) {
        const snapshot = await lighterApi.getAccountSnapshot(accountIndex);
        
        const totalPnL = snapshot.positions ? 
          Object.values(snapshot.positions).reduce((sum, p) => 
            sum + parseFloat(p.unrealized_pnl || "0") + parseFloat(p.realized_pnl || "0"), 0) : 0;

        metricsData.push({
          address,
          totalPnL,
          winRate: 0,
          totalTrades: 0,
          portfolioValue: parseFloat(snapshot.stats?.portfolio_value || "0")
        });
      }
    }

    setMetrics(metricsData);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <CardWatermark />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Multi-Wallet Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <Input
              placeholder="Comparison name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              placeholder="Wallet addresses (comma-separated)"
              value={newAddresses}
              onChange={(e) => setNewAddresses(e.target.value)}
              className="md:col-span-2 h-9 text-xs"
            />
          </div>
          <Button onClick={addComparison} className="w-full h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Comparison
          </Button>
        </CardContent>
      </Card>

      {comparisons.map((comp, idx) => (
        <Card 
          key={comp.id} 
          className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <CardWatermark />
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 relative">
            <CardTitle className="text-sm font-medium">{comp.name}</CardTitle>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMetrics(comp.wallet_addresses)}
                className="h-7 text-[10px] px-2.5"
              >
                Compare
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteComparison(comp.id)}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-1.5">
              {comp.wallet_addresses.map((addr, i) => (
                <div key={i}>
                  <Badge variant="outline" className="text-[10px] font-mono">{addr}</Badge>
                </div>
              ))}
            </div>

            {loading && <div className="text-center py-3 text-xs text-muted-foreground">Loading metrics...</div>}

            {!loading && metrics.length > 0 && (
              <div className="mt-3 space-y-2">
                {metrics.map((m, i) => (
                  <div 
                    key={i} 
                    className="p-3 border border-border/50 rounded-lg bg-background/50 animate-in fade-in duration-300"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[9px] font-mono">{m.address}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Total PnL</p>
                        <p className={`text-xs font-bold flex items-center gap-0.5 ${m.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {m.totalPnL >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {formatCurrency(m.totalPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Portfolio</p>
                        <p className="text-xs font-bold">{formatCurrency(m.portfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Win Rate</p>
                        <p className="text-xs font-bold">{formatPercentage(m.winRate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}