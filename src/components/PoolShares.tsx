import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Pool Shares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No pool participation</p>
        </CardContent>
      </Card>
    );
  }

  const totalInvested = shares.reduce((sum, s) => sum + parseFloat(s.entry_usdc), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Pool Shares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Total Pools</p>
            <p className="text-2xl font-bold">{shares.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {shares.map((share, index) => (
            <div 
              key={index}
              className="p-4 border rounded-lg bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">Pool #{share.public_pool_index}</Badge>
                <span className="text-sm font-semibold">
                  {share.shares_amount.toLocaleString()} shares
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entry Value</span>
                <span className="font-medium">{formatCurrency(parseFloat(share.entry_usdc))}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
