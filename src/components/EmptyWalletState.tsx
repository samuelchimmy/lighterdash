import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExclamationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";

export function EmptyWalletState() {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-1.5 text-xs">
            <WalletIcon className="h-3.5 w-3.5" />
            Wallet Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-3 px-4">
          <div className="rounded-full bg-muted p-2.5">
            <ExclamationCircleIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1.5 max-w-md">
            <h3 className="text-sm font-semibold text-foreground">No Trading Activity</h3>
            <p className="text-[10px] text-muted-foreground">
              This wallet doesn't have any active positions or recent trading history on Lighter. 
              Start trading to see your performance metrics, PnL charts, and position analytics here.
            </p>
          </div>
          <div className="bg-muted/30 border border-border/30 rounded-lg p-3 max-w-md">
            <h4 className="text-[10px] font-semibold text-foreground mb-1.5">Available Data:</h4>
            <ul className="text-[9px] text-muted-foreground space-y-0.5">
              <li>✓ Account stats (collateral, balance, leverage)</li>
              <li>✓ Historical trading volume</li>
              <li>✗ No active positions</li>
              <li>✗ No recent trades</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
