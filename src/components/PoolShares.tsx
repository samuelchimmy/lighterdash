import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/lighter-api";
import { Coins } from "lucide-react";

interface PoolShare {
  public_pool_index: number;
  shares_amount: number;
  entry_usdc: string;
}

interface PoolSharesProps {
  shares: PoolShare[];
}

export function PoolShares({ shares }: PoolSharesProps) {
  if (shares.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Pool Shares</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">No pool participation</p>
      </Card>
    );
  }

  const totalInvested = shares.reduce((sum, s) => sum + parseFloat(s.entry_usdc), 0);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Pool Shares</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Total Pools</p>
            <p className="text-2xl font-bold text-foreground">{shares.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {shares.map((share, index) => (
            <div 
              key={index}
              className="p-4 border border-border/50 rounded-lg bg-secondary/30 space-y-2 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">Pool #{share.public_pool_index}</Badge>
                <span className="text-sm font-semibold text-foreground">
                  {share.shares_amount.toLocaleString()} shares
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entry Value</span>
                <span className="font-medium text-foreground">{formatCurrency(parseFloat(share.entry_usdc))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
