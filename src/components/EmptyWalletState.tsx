import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExclamationCircleIcon, WalletIcon } from "@heroicons/react/24/solid";

export function EmptyWalletState() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Wallet Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="rounded-full bg-muted p-4">
            <ExclamationCircleIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-lg font-semibold text-foreground">No Trading Activity</h3>
            <p className="text-sm text-muted-foreground">
              This wallet doesn't have any active positions or recent trading history on Lighter. 
              Start trading to see your performance metrics, PnL charts, and position analytics here.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 max-w-md">
            <h4 className="text-sm font-semibold text-foreground mb-2">Available Data:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
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
