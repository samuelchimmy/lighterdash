import { MarketStats } from "@/components/MarketStats";
import { OrderBookDepth } from "@/components/OrderBookDepth";
import { LiveTradeFeed } from "@/components/LiveTradeFeed";
import { PlatformVolume } from "@/components/PlatformVolume";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowLeft, Calculator, Activity } from "lucide-react";

const LighterAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Lighter Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time market data and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/calculator')}
                className="gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden md:inline">Calculator</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Info Card */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                About Lighter Analytics
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Track real-time market data across all Lighter perpetual markets. View live order books, 
              recent trades, funding rates, and comprehensive market statistics. All data is streamed 
              directly from Lighter's WebSocket API for instant updates.
            </p>
          </div>

          {/* Platform Volume Overview */}
          <PlatformVolume />

          {/* Market Stats Overview - Collapsible */}
          <MarketStats />

          {/* Order Book & Live Trades Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderBookDepth />
            <LiveTradeFeed />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LighterAnalytics;
