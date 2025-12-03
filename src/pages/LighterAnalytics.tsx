import { MarketStats } from "@/components/MarketStats";
import { OrderBookDepth } from "@/components/OrderBookDepth";
import { LiveTradeFeed } from "@/components/LiveTradeFeed";
import { PlatformVolume } from "@/components/PlatformVolume";
import { Layout } from "@/components/Layout";
import { BarChart3, Activity } from "lucide-react";

const LighterAnalytics = () => {
  return (
    <Layout showNav={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-2">
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
      </div>
    </Layout>
  );
};

export default LighterAnalytics;
