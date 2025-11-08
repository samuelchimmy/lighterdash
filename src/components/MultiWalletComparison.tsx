import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle>Multi-Wallet Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Comparison name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="Wallet addresses (comma-separated)"
              value={newAddresses}
              onChange={(e) => setNewAddresses(e.target.value)}
              className="md:col-span-2"
            />
          </div>
          <Button onClick={addComparison} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Comparison
          </Button>
        </CardContent>
      </Card>

      {comparisons.map((comp) => (
        <Card key={comp.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{comp.name}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMetrics(comp.wallet_addresses)}
              >
                Compare
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteComparison(comp.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comp.wallet_addresses.map((addr, i) => (
                <div key={i} className="text-sm">
                  <Badge variant="outline">{addr}</Badge>
                </div>
              ))}
            </div>

            {loading && <div className="text-center py-4">Loading metrics...</div>}

            {!loading && metrics.length > 0 && (
              <div className="mt-4 space-y-3">
                {metrics.map((m, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">{m.address}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total PnL</p>
                        <p className={`font-bold flex items-center gap-1 ${m.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {m.totalPnL >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(m.totalPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Portfolio</p>
                        <p className="font-bold">{formatCurrency(m.portfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="font-bold">{formatPercentage(m.winRate)}</p>
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
