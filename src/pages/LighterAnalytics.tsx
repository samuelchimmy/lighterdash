import { MarketStats } from "@/components/MarketStats";
import { OrderBookDepth } from "@/components/OrderBookDepth";
import { LiveTradeFeed } from "@/components/LiveTradeFeed";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowLeft } from "lucide-react";

const LighterAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 glow-primary rounded-lg" />
                <BarChart3 className="w-8 h-8 text-primary relative" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Lighter Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time market data and analytics
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Info Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              About Lighter Analytics
            </h3>
            <p className="text-muted-foreground text-sm">
              Track real-time market data across all Lighter perpetual markets. View live order books, 
              recent trades, funding rates, and comprehensive market statistics. All data is streamed 
              directly from Lighter's WebSocket API for instant updates.
            </p>
          </div>

          {/* Market Stats Overview */}
          <MarketStats />

          {/* Order Book & Live Trades Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderBookDepth />
            <LiveTradeFeed />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Community-built analytics for Lighter • Not affiliated with Lighter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LighterAnalytics;
