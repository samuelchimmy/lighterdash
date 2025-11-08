import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, Save } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/lighter-api";

export function BacktestingTool() {
  const [strategyName, setStrategyName] = useState("");
  const [strategyType, setStrategyType] = useState("momentum");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const runBacktest = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    setRunning(true);
    
    // Simulate backtest (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      total_return: Math.random() * 100 - 30,
      sharpe_ratio: Math.random() * 2,
      max_drawdown: Math.random() * -20,
      win_rate: 0.45 + Math.random() * 0.3,
      total_trades: Math.floor(Math.random() * 500) + 50
    };

    setResults(mockResults);
    setRunning(false);
    toast.success("Backtest completed!");
  };

  const saveBacktest = async () => {
    if (!results) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save backtests");
      return;
    }

    const { error } = await supabase
      .from("backtest_results")
      .insert({
        user_id: user.id,
        name: strategyName || `Backtest ${new Date().toLocaleDateString()}`,
        strategy_config: { type: strategyType },
        start_date: startDate,
        end_date: endDate,
        ...results
      });

    if (error) {
      toast.error("Failed to save backtest");
      return;
    }

    toast.success("Backtest saved!");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Backtesting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Strategy Name</Label>
              <Input
                placeholder="My Strategy"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Strategy Type</Label>
              <Select value={strategyType} onValueChange={setStrategyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momentum">Momentum</SelectItem>
                  <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="grid">Grid Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runBacktest} disabled={running} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {running ? "Running..." : "Run Backtest"}
            </Button>
            {results && (
              <Button onClick={saveBacktest} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${results.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {results.total_return >= 0 ? '+' : ''}{results.total_return.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{results.sharpe_ratio.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-500">{results.max_drawdown.toFixed(2)}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(results.win_rate)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{results.total_trades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
